const API_URL = '/fcgi';
const STORAGE_KEY = 'results_v2_green_fmt_fixedCircle_v2_xrange';
const MAX_DECIMALS = 5;

document.addEventListener('DOMContentLoaded', () => {
    const form        = document.getElementById('control-form');
    const xInput      = document.getElementById('x-input');
    const clearBtn    = document.getElementById('clear-history');
    const tableBody   = document.querySelector('#result-table tbody');
    const toastBox    = document.getElementById('toast');

    // SVG layers
    const pointsLayer  = document.getElementById('points');
    const figuresLayer = document.getElementById('figures');
    const ticksLayer   = document.getElementById('ticks');
    const labelsLayer  = document.getElementById('labels');
    const minorGrid    = document.getElementById('grid-minor');
    const majorGrid    = document.getElementById('grid-major');

    let results = loadHistory();
    renderTable(results);
    redrawGeometry();

    document.getElementById('r-block').addEventListener('change', redrawGeometry);

    // Ограничиваем ввод до 5 знаков после запятой (клиентский уровень)
    xInput.addEventListener('input', () => {
        let v = xInput.value.replace(',', '.');
        // Разрешаем только один знак '+'/'-' в начале и одну точку
        // Остальные посторонние символы убираем
        v = v.replace(/[^0-9+.\-]/g, '');
        // Удаляем все '+' кроме первого, и '-' кроме первого
        v = v.replace(/(.*?)[+]/g, (_, p1) => p1.includes('+') ? p1 : p1 + '+')
            .replace(/(.*?)[-]/g, (_, p1) => p1.includes('-') ? p1 : p1 + '-');
        // Нормализуем знак (если есть и '+' и '-', оставляем первый встретившийся)
        v = v.replace(/(?!^)[+\-]/g, '');
        // Оставляем только первую точку
        const firstDot = v.indexOf('.');
        if (firstDot !== -1) {
            v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
        }
        // Обрезаем дробную часть до MAX_DECIMALS символов
        if (firstDot !== -1) {
            const sign = v.startsWith('+') || v.startsWith('-') ? v[0] : '';
            const body = sign ? v.slice(1) : v;
            const [intPart, fracPart = ''] = body.split('.');
            const trimmedFrac = fracPart.slice(0, MAX_DECIMALS);
            v = sign + (intPart || '0') + (trimmedFrac.length ? '.' + trimmedFrac : (firstDot === v.length - 1 ? '.' : ''));
        }
        xInput.value = v;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const rawX  = xInput.value.trim().replace(',', '.');   // отправляем строку как вводил пользователь (с нормализованной точкой)
        const yVal  = getCheckedValue(form.elements['y']);
        const rVals = getCheckedList(form.elements['r']);

        const err = validate(rawX, yVal, rVals);
        if (err) { toastError(err); return; }

        const clientTime = new Date().toLocaleTimeString();

        const params = new URLSearchParams();
        params.append('x', rawX);
        params.append('y', yVal);
        rVals.forEach(rv => params.append('r', rv));
        params.append('clientTime', clientTime);

        fetch(API_URL + '?' + params.toString(), { method:'GET' })
            .then(r => r.text().then(t => ({ ok:r.ok, status:r.status, text:t })))
            .then(o => {
                if (!o.ok) throw new Error('HTTP ' + o.status + ': ' + o.text.slice(0,120));
                let json;
                try { json = JSON.parse(o.text); } catch { throw new Error('Невалидный JSON'); }
                if (json.error) { toastError(json.error); return; }
                if (!Array.isArray(json.results)) { toastError('Нет массива results'); return; }

                json.results.slice().reverse().forEach(r => results.unshift(r));
                saveHistory(results);
                renderTable(results);
                redrawGeometry();
                plotNew(json.results);
                toastSuccess('Готово');
            })
            .catch(e2 => toastError('Ошибка: ' + e2.message));
    });

    clearBtn.addEventListener('click', () => {
        results = [];
        saveHistory(results);
        renderTable(results);
        pointsLayer.innerHTML = '';
        toastSuccess('История очищена');
    });

    /* ================== Валидация X ================== */
    function validate(xStr, yVal, rList){
        if (!xStr) return 'Введите X';
        if (xStr.length > 32) return 'Слишком длинное число X';
        if (/[eE]/.test(xStr)) return 'Не используйте экспоненциальную форму';
        if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(xStr)) return 'X не число';

        // Не более 5 знаков после запятой (игнорируя завершающие нули)
        const dot = xStr.indexOf('.');
        if (dot >= 0) {
            const frac = xStr.slice(dot + 1);
            const fracNoZeros = frac.replace(/0+$/, '');
            if (fracNoZeros.length > MAX_DECIMALS) return 'X: не более 5 знаков после запятой';
        }

        // Строчная проверка интервала (-5;5)
        const s = xStr.startsWith('+') ? xStr.slice(1) : xStr;
        if (s.startsWith('-')) {
            if (s === '-5' || s.startsWith('-5.')) return 'X вне диапазона (-5; 5)';
        } else {
            if (s === '5' || s.startsWith('5.')) return 'X вне диапазона (-5; 5)';
        }

        if (!yVal) return 'Выберите Y';
        if (!rList.length) return 'Выберите хотя бы один R';
        return null;
    }

    function getCheckedValue(list){
        if (!list) return null;
        if (list.length === undefined) return list.checked ? list.value : null;
        for (const el of list) if (el.checked) return el.value;
        return null;
    }
    function getCheckedList(list){
        const out = [];
        if (!list) return out;
        if (list.length === undefined){ if (list.checked) out.push(list.value); return out; }
        for (const el of list) if (el.checked) out.push(el.value);
        return out;
    }

    function loadHistory(){
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch { return []; }
    }
    function saveHistory(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

    // Форматирование без "некрасивого" округления к 5 — показываем до 5 знаков, обрезая хвостовые нули
    function fmt(n){
        if (typeof n !== 'number' || !isFinite(n)) return '';
        // toFixed(5) безопасно, т.к. ввод и сервер ограничены 5 знаками после запятой
        const s = n.toFixed(MAX_DECIMALS);
        return s.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
    }

    function renderTable(arr){
        tableBody.innerHTML = '';
        for (const row of arr){
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${fmt(row.x)}</td>
        <td>${fmt(row.y)}</td>
        <td>${fmt(row.r)}</td>
        <td style="color:${row.hit ? '#2dff9a':'#ff8070'};font-weight:600">${row.hit ? 'Да':'Нет'}</td>
        <td>${row.clientTime || ''}</td>
        <td>${row.execTimeNs ?? ''}</td>`;
            tableBody.appendChild(tr);
        }
        redrawPoints(arr);
    }

    function plotNew(arr){ arr.forEach(r => plotPoint(r.x, r.y, r.r, r.hit)); }

    function redrawGeometry(){
        const rVals = getCheckedList(form.elements['r']).map(Number);
        const maxR  = rVals.length ? Math.max(...rVals) : 5;
        const limit = Math.max(6, maxR + 1);
        document.getElementById('plane').setAttribute('viewBox', `${-limit} ${-limit} ${limit*2} ${limit*2}`);
        buildGrid(limit);
        buildTicks(maxR);
        buildFigures(maxR);
        redrawPoints(results);
    }

    function buildGrid(limit){
        minorGrid.innerHTML=''; majorGrid.innerHTML='';
        for(let i=-limit;i<=limit;i++){
            const vl=line(i,-limit,i,limit), hl=line(-limit,i,limit,i);
            styleMinor(vl); styleMinor(hl);
            minorGrid.appendChild(vl); minorGrid.appendChild(hl);
        }
        for(let i=-limit;i<=limit;i++){
            const vl=line(i,-limit,i,limit), hl=line(-limit,i,limit,i);
            styleMajor(vl); styleMajor(hl);
            majorGrid.appendChild(vl); majorGrid.appendChild(hl);
        }
    }
    function styleMinor(l){ l.setAttribute('stroke','rgba(120,255,170,0.12)'); l.setAttribute('stroke-width','0.025'); }
    function styleMajor(l){ l.setAttribute('stroke','rgba(120,255,170,0.30)'); l.setAttribute('stroke-width','0.04'); }

    function buildTicks(maxR){
        ticksLayer.innerHTML=''; labelsLayer.innerHTML='';
        if(!maxR||!isFinite(maxR)) maxR=5;
        const values=[-maxR,-maxR/2,0,maxR/2,maxR];
        const used=new Set();
        values.forEach(v=>{
            const kx='x'+v, ky='y'+v;
            if(!used.has(kx)){
                addTick(v,0,'x');
                if(Math.abs(v)>1e-9) addLabel(v,-0.35,fmt(v));
                used.add(kx);
            }
            if(!used.has(ky)){
                addTick(0,v,'y');
                if(Math.abs(v)>1e-9) addLabel(0.35,v,fmt(v));
                used.add(ky);
            }
        });
        addLabel(maxR+0.45,0.5,'X');
        addLabel(0.5,maxR+0.7,'Y');
    }

    function buildFigures(r){
        figuresLayer.innerHTML='';
        if(!r||!isFinite(r)) r=5;
        const h=r/2;

        // Треугольник
        const tri=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        tri.setAttribute('points',`0,0 ${h},0 0,${h}`);
        tri.setAttribute('class','fig-tri');
        figuresLayer.appendChild(tri);

        // Четверть окружности (аппроксимация)
        const segs=40;
        const pts=[];
        pts.push(`0,0`);
        pts.push(`-${h},0`);
        for(let i=1;i<=segs;i++){
            const t=(Math.PI/2)*(i/segs);
            const x=-h*Math.cos(t);
            const y= h*Math.sin(t);
            pts.push(`${x},${y}`);
        }
        const circ=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        circ.setAttribute('points',pts.join(' '));
        circ.setAttribute('class','fig-circ');
        figuresLayer.appendChild(circ);

        // Прямоугольник
        const rect=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        rect.setAttribute('points',`0,0 -${h},0 -${h},-${r} 0,-${r}`);
        rect.setAttribute('class','fig-rect');
        figuresLayer.appendChild(rect);
    }

    function plotPoint(x,y,r,hit){
        if(!isFinite(x)||!isFinite(y)) return;
        const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',x);
        c.setAttribute('cy',-y);
        c.setAttribute('r',0.22);
        c.setAttribute('fill',hit?'#2dff9a':'#ff7b68');
        pointsLayer.appendChild(c);
    }

    function redrawPoints(arr){
        pointsLayer.innerHTML='';
        arr.forEach(row => plotPoint(row.x,row.y,row.r,row.hit));
    }

    // helpers
    function line(x1,y1,x2,y2){
        const l=document.createElementNS('http://www.w3.org/2000/svg','line');
        l.setAttribute('x1',x1); l.setAttribute('y1',y1);
        l.setAttribute('x2',x2); l.setAttribute('y2',y2);
        return l;
    }
    function addTick(x,y,axis){
        const len=0.18;
        const l=document.createElementNS('http://www.w3.org/2000/svg','line');
        if(axis==='x'){
            l.setAttribute('x1',x); l.setAttribute('x2',x);
            l.setAttribute('y1',-len); l.setAttribute('y2',len);
        } else {
            l.setAttribute('y1',y); l.setAttribute('y2',y);
            l.setAttribute('x1',-len); l.setAttribute('x2',len);
        }
        l.setAttribute('stroke','#b7ffe0');
        l.setAttribute('stroke-width','0.04');
        ticksLayer.appendChild(l);
    }
    function addLabel(x,y,text){
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',x);
        t.setAttribute('y',-y);
        t.setAttribute('class','tick-label');
        t.textContent=text;
        labelsLayer.appendChild(t);
    }

    // ======= Toast helpers =======
    let toastTimer = null;
    function showToast(message, type='error') {
        if (!toastBox) return;
        toastBox.className = 'toast ' + type;
        toastBox.innerHTML = `<span class="badge">${type === 'error' ? 'Ошибка' : 'OK'}</span><div class="msg">${message}</div>`;
        toastBox.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastBox.classList.remove('show'), 4000);
    }
    function toastError(msg){ showToast(msg, 'error'); }
    function toastSuccess(msg){ showToast(msg, 'success'); }
});