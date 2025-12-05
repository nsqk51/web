// Детектим scale из data-атрибута svg и используем его при расчёте координат
function handleGraphClick(event) {
    const svg = event.currentTarget || document.getElementById('graph-svg');
    if (!svg) return;

    // R читаем из скрытого поля r-hidden
    const rHidden = document.querySelector('[id$=":r-hidden"]');
    const rValue = rHidden ? parseFloat(rHidden.value) : NaN;
    if (!rValue || isNaN(rValue)) {
        alert('Сначала выберите значение R.');
        return;
    }

    const rect = svg.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;

    // берём динамический scale из data-атрибута
    const scaleAttr = svg.getAttribute('data-scale');
    const scale = scaleAttr ? parseFloat(scaleAttr) : 40;

    // координаты в логическом пространстве
    const centerX = 160;
    const centerY = 160;

    const viewBox = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : { width: svg.clientWidth, height: svg.clientHeight };
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    const x = ((clientX * scaleX - centerX) / scale).toFixed(2);
    const y = ((centerY - clientY * scaleY) / scale).toFixed(2);

    const graphXInput = document.querySelector('[id$=":graph-x"]');
    const graphYInput = document.querySelector('[id$=":graph-y"]');
    const graphTagsInput = document.querySelector('[id$=":graph-tags"]');
    const submitBtn = document.querySelector('[id$=":graph-submit"]');

    if (!graphXInput || !graphYInput || !submitBtn) {
        console.error('Не найдены скрытые поля/кнопка для отправки графика');
        return;
    }

    graphXInput.value = x;
    graphYInput.value = y;
    if (graphTagsInput) graphTagsInput.value = ''; // клики НЕ должны отправлять теги

    submitBtn.click();
}

document.addEventListener('DOMContentLoaded', function() {
    const svg = document.getElementById('graph-svg');
    if (svg && !svg.onclick) svg.addEventListener('click', handleGraphClick);
});