const MAX_DECIMALS = 5;

document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('control-form');
    const xHidden    = document.getElementById('x-hidden');
    const yInput     = document.getElementById('y-input');
    const sourceFld  = document.getElementById('source-hidden');
    const clientFld  = document.getElementById('client-time');
    const toastBox   = document.getElementById('toast');

    // Слои графика
    const plane        = document.getElementById('plane');
    const pointsLayer  = document.getElementById('points');
    const figuresLayer = document.getElementById('figures');
    const ticksLayer   = document.getElementById('ticks');
    const labelsLayer  = document.getElementById('labels');
    const minorGrid    = document.getElementById('grid-minor');
    const majorGrid    = document.getElementById('grid-major');

    // 1) Кнопки X: активность и значение hidden
    const xButtonsWrap = document.getElementById('x-buttons');
    if (xButtonsWrap && xHidden) {
        const allBtns = Array.from(xButtonsWrap.querySelectorAll('.btn-x'));
        allBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                allBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                xHidden.value = btn.dataset.x;
            });
        });
        // Если hidden уже содержит значение (например, после возврата со страницы результата), подсветим соответствующую кнопку
        if (xHidden.value) {
            const preset = allBtns.find(b => b.dataset.x === xHidden.value);
            if (preset) preset.classList.add('active');
        }
    }

    // 2) Маска ввода Y
    if (yInput) {
        yInput.addEventListener('input', () => {
            let v = yInput.value.replace(',', '.').replace(/[^0-9+.\-]/g, '');
            v = v.replace(/(?!^)[+\-]/g, '');
            const firstDot = v.indexOf('.');
            if (firstDot !== -1) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
            if (firstDot !== -1) {
                const [intPart, fracPart=''] = v.split('.');
                if (fracPart.length > MAX_DECIMALS) v = `${intPart}.${fracPart.slice(0, MAX_DECIMALS)}`;
            }
            yInput.value = v;
        });
    }

    // 3) Читаем историю из таблицы и рисуем
    const historyFromTable = readHistoryFromTable();
    redrawAll();
    const rBlock = document.getElementById('r-block');
    if (rBlock) rBlock.addEventListener('change', redrawAll);

    // 4) Клик по графику -> POST без ограничений по X/Y
    if (plane && form) {
        plane.addEventListener('click', (e) => {
            const rVals = getCheckedList(form.elements['r']);
            if (!rVals.length) { toastError('Выберите хотя бы один R'); return; }

            const pt = getSvgPoint(plane, e.clientX, e.clientY);
            const mathX = pt.x;
            const mathY = -pt.y;
            if (!isFinite(mathX) || !isFinite(mathY)) { toastError('Координаты клика некорректны'); return; }

            submitClickAsPost(mathX, mathY, rVals);
        });
    }

    // 5) Сабмит формы (валидация и обычный POST)
    if (form) {
        form.addEventListener('submit', (e) => {
            const rVals = getCheckedList(form.elements['r']);
            const err = validateForm((xHidden?.value || '').toString().trim(),
                (yInput?.value || '').toString().trim().replace(',', '.'),
                rVals);
            if (err) {
                e.preventDefault();
                toastError(err);
                return;
            }
            if (sourceFld) sourceFld.value = 'form';
            if (clientFld) clientFld.value = new Date().toLocaleTimeString();
        });
    }

    // ===== Functions =====
    function redrawAll(){
        redrawGeometry();
        redrawPoints(historyFromTable);
    }

    function readHistoryFromTable(){
        const arr = [];
        const tbody = document.querySelector('#result-table tbody');
        if (!tbody) return arr;
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length < 4) return;
            const x = parseFloat((tds[0].textContent || '').replace(',', '.'));
            const y = parseFloat((tds[1].textContent || '').replace(',', '.'));
            const r = parseFloat((tds[2].textContent || '').replace(',', '.'));
            const hitTxt = (tds[3].textContent || '').trim().toLowerCase();
            const hit = hitTxt.startsWith('да') || hitTxt === 'true';
            if (isFinite(x) && isFinite(y)) arr.push({ x, y, r: isFinite(r) ? r : undefined, hit });
        });
        return arr;
    }

    function getCheckedList(list){
        const out = [];
        if (!list) return out;
        if (list.length === undefined){ if (list.checked) out.push(list.value); return out; }
        for (const el of list) if (el.checked) out.push(el.value);
        return out;
    }

    function validateForm(xStr, yStr, rList) {
        if (!xStr) return 'Укажите X (кнопкой или кликом по графику)';
        if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(xStr) || xStr.endsWith('.')) return 'X некорректен';
        const x = parseFloat(xStr);
        if (!(x > -5 && x < 5)) return 'X вне диапазона (-5; 5)';

        if (!yStr) return 'Введите Y';
        if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(yStr) || yStr.endsWith('.')) return 'Y некорректен';
        const y = parseFloat(yStr);
        if (!(y > -3 && y < 5)) return 'Y должен быть в интервале (-3; 5), границы не включительно';

        if (!rList.length) return 'Выберите хотя бы один R';
        return null;
    }

    // POST для клика
    function submitClickAsPost(x, y, rList) {
        const f = document.createElement('form');
        f.method = 'POST';
        f.action = form.action;
        f.acceptCharset = 'UTF-8';
        f.style.display = 'none';
        appendHidden(f, 'x', String(trim(x)));
        appendHidden(f, 'y', String(trim(y)));
        rList.forEach(r => appendHidden(f, 'r', String(r)));
        appendHidden(f, 'clientTime', new Date().toLocaleTimeString());
        appendHidden(f, 'source', 'graph');
        document.body.appendChild(f);
        f.submit();
    }
    function appendHidden(formEl, name, value) {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = name;
        i.value = value;
        formEl.appendChild(i);
    }

    // Рисование
    function redrawGeometry(){
        if (!plane) return;
        const rVals = form ? getCheckedList(form.elements['r']).map(Number) : [];
        const maxR  = rVals.length ? Math.max(...rVals) : 5;
        const limit = Math.max(6, maxR + 1);
        plane.setAttribute('viewBox', `${-limit} ${-limit} ${limit*2} ${limit*2}`);
        buildGrid(limit);
        buildTicks(maxR);
        buildFigures(maxR);
    }

    function redrawPoints(arr){
        if (!pointsLayer) return;
        pointsLayer.innerHTML = '';
        arr.forEach(row => plotPoint(row.x,row.y,row.r,row.hit));
    }
    function plotPoint(x,y,_r,hit){
        if(!isFinite(x)||!isFinite(y) || !pointsLayer) return;
        const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',x);
        c.setAttribute('cy',-y);
        c.setAttribute('r',0.22);
        c.setAttribute('fill',hit?'#2dff9a':'#ff7b68');
        pointsLayer.appendChild(c);
    }

    function buildGrid(limit){
        if (!minorGrid || !majorGrid) return;
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
        if (!ticksLayer || !labelsLayer) return;
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
        if (!figuresLayer) return;
        figuresLayer.innerHTML='';
        if(!r||!isFinite(r)) r=5;

        // III: треугольник (0,0), (-R/2,0), (0,-R)
        const tri=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        tri.setAttribute('points',`0,0 ${-r/2},0 0,${-r}`);
        tri.setAttribute('class','fig-tri');
        figuresLayer.appendChild(tri);

        // I: четверть окружности радиуса R
        const segs=48, pts=['0,0', `0,${r}`];
        for(let i=1;i<=segs;i++){
            const t=(Math.PI/2)*(i/segs);
            const x=r*Math.sin(t);
            const y=r*Math.cos(t);
            pts.push(`${x},${y}`);
        }
        const circ=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        circ.setAttribute('points',pts.join(' '));
        circ.setAttribute('class','fig-circ');
        figuresLayer.appendChild(circ);

        // IV: прямоугольник (0,0)-(R/2,0)-(R/2,-R)-(0,-R)
        const rect=document.createElementNS('http://www.w3.org/2000/svg','polygon');
        rect.setAttribute('points',`0,0 ${r/2},0 ${r/2},${-r} 0,${-r}`);
        rect.setAttribute('class','fig-rect');
        figuresLayer.appendChild(rect);
    }

    // helpers
    function line(x1,y1,x2,y2){
        const l=document.createElementNS('http://www.w3.org/2000/svg','line');
        l.setAttribute('x1',x1); l.setAttribute('y1',y1);
        l.setAttribute('x2',x2); l.setAttribute('y2',y2);
        return l;
    }
    function addTick(x,y,axis){
        if (!ticksLayer) return;
        const len=0.18;
        const l=document.createElementNS('http://www.w3.org/2000/svg','line');
        if(axis==='x'){ l.setAttribute('x1',x); l.setAttribute('x2',x); l.setAttribute('y1',-len); l.setAttribute('y2',len); }
        else { l.setAttribute('y1',y); l.setAttribute('y2',y); l.setAttribute('x1',-len); l.setAttribute('x2',len); }
        l.setAttribute('stroke','#b7ffe0');
        l.setAttribute('stroke-width','0.04');
        ticksLayer.appendChild(l);
    }
    function addLabel(x,y,text){
        if (!labelsLayer) return;
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',x);
        t.setAttribute('y',-y);
        t.setAttribute('class','tick-label');
        t.textContent=text;
        labelsLayer.appendChild(t);
    }
    function getSvgPoint(svg, clientX, clientY){
        const vb = svg.viewBox.baseVal;
        const rect = svg.getBoundingClientRect();
        const sx = (clientX - rect.left) / rect.width;
        const sy = (clientY - rect.top)  / rect.height;
        return { x: vb.x + sx * vb.width, y: vb.y + sy * vb.height };
    }

    // форматирование
    function fmt(n){
        if (typeof n !== 'number' && typeof n !== 'string') return '';
        const num = Number(n);
        if (!isFinite(num)) return '';
        const s = num.toFixed(MAX_DECIMALS);
        return s.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
    }
    function trim(n){
        const s = Number(n).toFixed(MAX_DECIMALS);
        return s.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
    }

    // Toast helpers
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
});