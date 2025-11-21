function handleGraphClick(event) {
    const svg = event.currentTarget;
    const rValue = parseFloat(document.querySelector('[id$=":r-value"]')?.textContent.match(/[\d.]+/)?.[0]);

    if (!rValue || isNaN(rValue)) {
        alert('Сначала выберите значение R, нажав на одну из кнопок (1, 2, 3, 4, 5)!');
        return;
    }

    const rect = svg.getBoundingClientRect();
    const svgX = event.clientX - rect.left;
    const svgY = event.clientY - rect.top;

    // Масштаб фиксированный - всегда 40
    const scale = 40;
    const centerX = 200;
    const centerY = 200;

    const svgElement = event.currentTarget;
    const viewBox = svgElement.viewBox.baseVal;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    const x = ((svgX * scaleX - centerX) / scale).toFixed(2);
    const y = ((centerY - svgY * scaleY) / scale).toFixed(2);

    console.log('Клик по графику: X=' + x + ', Y=' + y + ', R=' + rValue);

    const graphXInput = document.querySelector('[id$=":graph-x"]');
    const graphYInput = document.querySelector('[id$=":graph-y"]');
    const submitBtn = document.querySelector('[id$=":graph-submit"]');

    if (!graphXInput || !graphYInput || !submitBtn) {
        console.error('Не найдены элементы формы для отправки');
        return;
    }

    graphXInput.value = x;
    graphYInput.value = y;

    submitBtn.click();
}