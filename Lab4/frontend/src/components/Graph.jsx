import React from 'react'

export default function Graph({ r, points, onPoint }) {
    // Внутренний размер координатной сетки (не влияет на отображение на экране, только на пропорции)
    const size = 300
    const pad = 30
    const half = size / 2
    const axisMax = 4.5

    const scale = (half - pad) / axisMax

    const toSvgX = (x) => half + x * scale
    const toSvgY = (y) => half - y * scale

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v))
    }

    function onClick(e) {
        // Для корректного расчета координат при ресайзе нужно брать размеры реального DOM-элемента
        const svg = e.currentTarget
        const rect = svg.getBoundingClientRect()

        // Координаты клика внутри SVG элемента
        const clickX = e.clientX - rect.left
        const clickY = e.clientY - rect.top

        // Масштабируем координаты клика обратно к внутреннему размеру (size = 300)
        // scaleX = (внутренняя ширина / реальная ширина)
        const scaleFactorX = size / rect.width
        const scaleFactorY = size / rect.height

        const internalX = clickX * scaleFactorX
        const internalY = clickY * scaleFactorY

        const worldX = (internalX - half) / scale
        const worldY = (half - internalY) / scale

        const x = clamp(worldX, -4, 4)
        const y = clamp(worldY, -4.999, 4.999)

        if (onPoint) onPoint(x, y)
    }

    const R = r > 0 ? Number(r) : 0

    const tri = `${toSvgX(0)},${toSvgY(0)} ${toSvgX(R)},${toSvgY(0)} ${toSvgX(0)},${toSvgY(R)}`

    const sqX = toSvgX(-R)
    const sqY = toSvgY(R)
    const sqW = Math.abs(toSvgX(0) - toSvgX(-R))
    const sqH = Math.abs(toSvgY(0) - toSvgY(R))

    const arcStartX = toSvgX(-R)
    const arcStartY = toSvgY(0)
    const arcEndX = toSvgX(0)
    const arcEndY = toSvgY(-R)
    const arcRad = R * scale

    const q3Path = [
        `M ${toSvgX(0)} ${toSvgY(0)}`,
        `L ${arcStartX} ${arcStartY}`,
        `A ${arcRad} ${arcRad} 0 0 0 ${arcEndX} ${arcEndY}`,
        `Z`
    ].join(' ')

    const ticks = [-4, -3, -2, -1, 1, 2, 3, 4]

    return (
        <svg
            // ВАЖНО: viewBox позволяет SVG растягиваться
            viewBox={`0 0 ${size} ${size}`}
            // Заставляем SVG занимать всю ширину родителя
            width="100%"
            height="100%"
            // Сохраняем пропорции, центрируем (график всегда будет квадратным внутри прямоугольника)
            preserveAspectRatio="xMidYMid meet"
            onClick={onClick}
            style={{
                // Убрали maxWidth, теперь график ограничен только размером карточки
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                cursor: 'crosshair',
                display: 'block',
                // Минимальная высота, чтобы график не схлопнулся, если контейнер пустой
                minHeight: '300px'
            }}
        >
            <line x1={0} y1={half} x2={size} y2={half} stroke="var(--muted)" strokeWidth="1" />
            <line x1={half} y1={0} x2={half} y2={size} stroke="var(--muted)" strokeWidth="1" />

            <polygon points={`${size},${half} ${size-8},${half-3} ${size-8},${half+3}`} fill="var(--muted)" />
            <polygon points={`${half},0 ${half-3},8 ${half+3},8`} fill="var(--muted)" />

            <g fill="var(--muted)" fontSize="10" textAnchor="middle" dominantBaseline="middle">
                {ticks.map(t => (
                    <g key={t}>
                        <line x1={toSvgX(t)} y1={half - 3} x2={toSvgX(t)} y2={half + 3} stroke="var(--muted)" />
                        <text x={toSvgX(t)} y={half + 15}>{t}</text>

                        <line x1={half - 3} y1={toSvgY(t)} x2={half + 3} y2={toSvgY(t)} stroke="var(--muted)" />
                        <text x={half - 15} y={toSvgY(t)}>{t}</text>
                    </g>
                ))}
            </g>

            {R > 0 && (
                <g fill="rgba(34, 197, 94, 0.3)" stroke="var(--primary)" strokeWidth="1">
                    <polygon points={tri} />
                    <rect x={sqX} y={sqY} width={sqW} height={sqH} />
                    <path d={q3Path} />
                </g>
            )}

            {points.map((p, i) => {
                if (Math.abs(p.x) > axisMax || Math.abs(p.y) > axisMax) return null
                return (
                    <circle
                        key={i}
                        cx={toSvgX(p.x)}
                        cy={toSvgY(p.y)}
                        r={4}
                        fill={p.hit ? '#4ade80' : '#f87171'}
                        stroke="#fff"
                        strokeWidth="1"
                    />
                )
            })}
        </svg>
    )
}