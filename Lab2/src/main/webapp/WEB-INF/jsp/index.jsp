<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="ru.nsqk.web.model.HitResult" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Лабораторная работа №2</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="icon" href="${pageContext.request.contextPath}/favicon.ico" sizes="any">
    <style>
        :root {
            --bg-body: #031c10;
            --accent: #2ddc7d;
            --accent-alt: #19a75d;
            --danger: #ff6161;
            --text: #e9ffee;
            --muted: #8ab59b;
            --radius: 15px;
            --font-main: "Inter", system-ui, sans-serif;
            --font-header: cursive;
            --grid-major: rgba(120,255,170,0.30);
            --grid-minor: rgba(120,255,170,0.12);
            --axis: #7dffb6;
            --fig-tri: #35d27b;
            --fig-circ: #2ab8ff;
            --fig-rect: #ffb347;
        }
        html, body { margin:0; padding:0; }
        body {
            font-family: var(--font-main);
            min-height:100vh;
            overflow-x:hidden;
            color: var(--text);
            background:
                    linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.42)),
                    url("${pageContext.request.contextPath}/media/fzt2.gif") center/cover fixed no-repeat,
                    var(--bg-body);
        }
        body.bg-debug {
            background:
                    linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.18)),
                    url("${pageContext.request.contextPath}/media/fzt2.gif") center/cover fixed no-repeat,
                    var(--bg-body);
            filter:brightness(1.18) saturate(1.25);
        }
        .shell { max-width:1250px; margin:0 auto; padding:26px 24px 48px; display:flex; flex-direction:column; gap:26px; }
        header.main-header { background:linear-gradient(135deg,rgba(30,120,70,0.32),rgba(20,90,55,0.42)); border:1px solid rgba(90,255,170,0.30); border-radius: var(--radius);
            padding:24px 28px; display:flex; align-items:center; justify-content:space-between; gap:28px; flex-wrap:wrap; box-shadow:0 4px 18px -6px rgba(0,0,0,0.55),0 0 0 1px rgba(70,200,130,0.08); backdrop-filter: blur(10px) saturate(1.15);}
        .header-title { font-family:var(--font-header); font-size:2.35rem; margin:0; letter-spacing:.5px; color:#cffff0; text-shadow:0 0 8px rgba(80,255,170,0.35);}
        .header-title::first-letter { color: var(--accent); font-size:3rem; text-shadow:0 0 10px rgba(80,255,170,0.55); }
        .header-meta { display:flex; flex-direction:column; gap:4px; font-size:0.92rem; color: var(--muted); }
        .header-meta span strong { color: var(--accent); font-weight:600; }
        .main-grid { display:grid; grid-template-columns: 1fr 1fr; gap:24px; }
        @media (max-width:1050px){ .main-grid { grid-template-columns:1fr; } }
        .pane { background:rgba(10,55,30,0.32); border:1px solid rgba(90,255,170,0.30); border-radius: var(--radius); padding:20px 22px 26px; display:flex; flex-direction:column; gap:18px; position:relative; backdrop-filter: blur(12px) saturate(1.25); box-shadow:0 6px 22px -8px rgba(0,0,0,0.65),0 0 0 1px rgba(70,200,130,0.12); }
        .pane.alt { background:rgba(14,70,38,0.36); }
        .pane h2 { margin:0; font-size:1.1rem; font-weight:600; letter-spacing:.5px; color:#d9ffe4; text-transform:uppercase; }
        #control-form { display:flex; flex-direction:column; gap:18px; }
        .form-row { display:flex; flex-direction:column; gap:8px; }
        .form-row label span { font-size:0.72rem; color: var(--muted); margin-left:6px; letter-spacing:.3px; }
        .inline-wrap { display:flex; flex-wrap:wrap; gap:12px 12px; align-items:center; }
        input[type="text"] { background:rgba(0,50,28,0.55); color:var(--text); border:1px solid rgba(110,255,180,0.35); padding:10px 12px; border-radius:10px; font-size:0.95rem; width:180px; box-shadow:inset 0 0 0 1px rgba(80,200,130,0.15); transition:.18s; }
        input[type="text"]:focus { outline:none; border-color: var(--accent); box-shadow:0 0 0 2px rgba(50,255,150,0.35); }
        .inline-label { display:flex; align-items:center; gap:6px; font-size:0.82rem; cursor:pointer; user-select:none; padding:4px 8px; background:rgba(60,150,95,0.18); border:1px solid rgba(60,180,110,0.35); border-radius:8px; transition:.15s; }
        .inline-label:hover { background:rgba(80,200,130,0.28); border-color: rgba(90,230,150,0.6); }
        .inline-label input { cursor:pointer; transform:translateY(1px); }
        .form-actions { display:flex; gap:14px; flex-wrap:wrap; }
        .btn { background:linear-gradient(145deg,#15884a,#0d6a39); color:#e6ffe9; border:1px solid rgba(100,255,170,0.35); padding:11px 22px; font-size:0.9rem; border-radius:11px; cursor:pointer; letter-spacing:.5px; font-weight:600; position:relative; overflow:hidden; transition:.2s; }
        .btn:hover { filter:brightness(1.12); border-color: var(--accent); box-shadow:0 0 0 2px rgba(50,255,170,0.25); }
        .btn.secondary { background:linear-gradient(145deg,#146e92,#0d4f70); }
        .note { font-size:0.7rem; color: var(--muted); letter-spacing:.4px; line-height:1.3; margin-top:-4px; }
        .table-block { grid-column:1 / -1; }
        table.data-grid { width:100%; border-collapse:collapse; font-size:0.8rem; border:1px solid rgba(90,210,140,0.35); overflow:hidden; border-radius:16px; background:rgba(0,40,20,0.25); backdrop-filter: blur(6px);}
        .data-grid thead th { background:linear-gradient(180deg,rgba(40,160,95,0.50),rgba(30,120,70,0.50)); font-weight:600; padding:9px 7px; text-align:center; color:#e4ffef; border-bottom:1px solid rgba(100,230,160,0.4); letter-spacing:.45px; font-size:0.7rem;}
        .data-grid tbody td { padding:7px 6px; text-align:center; border-top:1px solid rgba(80,170,120,0.22); color:#d4ffe3; }
        .data-grid tbody tr:nth-child(even) td { background:rgba(30,90,55,0.14); }
        .graph-wrapper { display:flex; flex-direction:column; align-items:center; gap:12px; }
        #graph { width:380px; height:380px; border:1px solid rgba(90,220,150,0.55); border-radius:18px; background:linear-gradient(180deg,rgba(0,35,18,0.55),rgba(0,55,28,0.42)); backdrop-filter: blur(6px); box-shadow:0 0 0 1px rgba(70,200,130,0.2),0 6px 18px -6px rgba(0,0,0,0.6); position:relative; overflow:hidden; }
        svg#plane { width:100%; height:100%; }
        .axis { stroke: var(--axis); stroke-width:0.06; marker-end:url(#arrow); }
        .grid-minor line { stroke: var(--grid-minor); stroke-width:0.025; }
        .grid-major line { stroke: var(--grid-major); stroke-width:0.04; }
        .fig-tri  { fill: rgba(53,210,123,0.32); stroke: var(--fig-tri);  stroke-width:0.07; }
        .fig-circ { fill: rgba(42,184,255,0.26); stroke: var(--fig-circ); stroke-width:0.07; }
        .fig-rect { fill: rgba(255,179,71,0.28); stroke: var(--fig-rect); stroke-width:0.07; }
        .tick-label { font-size:0.5px; fill: #b8ffd3; }
        .points circle { stroke:#081d10; stroke-width:0.08; }
        .legend { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; font-size:0.68rem; color:var(--muted); }
        .legend span { display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:rgba(0,60,30,0.35); border:1px solid rgba(70,220,150,0.4); border-radius:6px; }
        .legend i { width:14px; height:14px; border-radius:3px; display:inline-block; box-shadow:0 0 0 1px rgba(0,0,0,0.4); }
        .footer-note { margin-top:4px; font-size:0.62rem; color: var(--muted); text-align:center; letter-spacing:.4px; }
        @media (max-width:600px){ header.main-header { flex-direction:column; align-items:flex-start; } #graph { width:100%; height:320px; } }
        :focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
        .toast { position: fixed; top: 18px; right: 18px; z-index: 9999; max-width: 440px; padding: 12px 14px; border-radius: 12px; border:1px solid rgba(255,255,255,0.15);
            background: linear-gradient(135deg, rgba(10,55,30,0.9), rgba(22,85,50,0.9)); color: #eafff1; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(70,200,130,0.18);
            display: none; align-items: flex-start; gap: 10px; }
        .toast.show { display:flex; animation: toastIn .2s ease-out; }
        .toast.error { border-color: rgba(255,97,97,0.4); background: linear-gradient(135deg, rgba(60,20,20,0.9), rgba(90,30,30,0.9)); color:#ffeaea; }
        .toast.success { border-color: rgba(60,220,150,0.5); }
        .toast .badge { margin-top:2px; font-weight:700; letter-spacing:.4px; font-size:0.75rem; padding:2px 6px; border-radius:6px; background: rgba(80,200,130,0.22); border:1px solid rgba(80,200,130,0.35); color:#cfffe6; user-select:none; }
        .toast.error .badge { background: rgba(255,140,140,0.22); border-color: rgba(255,140,140,0.45); color:#ffdddd; }
        .toast .msg { font-size:0.9rem; line-height:1.3; }
        @keyframes toastIn { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* ===== Зеленые кнопки X + активная подсветка ===== */
        .x-buttons .btn-x {
            appearance: none; -webkit-appearance: none;
            border: 1px solid rgba(100, 255, 170, 0.35);
            background: linear-gradient(145deg, #15884a, #0d6a39);
            color: #e6ffe9;
            padding: 8px 12px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            letter-spacing: .3px;
            box-shadow: inset 0 0 0 1px rgba(80,200,130,0.15), 0 2px 6px rgba(0,0,0,0.25);
            transition: filter .15s ease, box-shadow .15s ease, border-color .15s ease, transform .02s ease;
        }
        .x-buttons .btn-x:hover { filter: brightness(1.08); border-color: rgba(120,255,190,0.6); }
        .x-buttons .btn-x:active { transform: translateY(1px); }
        .x-buttons .btn-x.active {
            outline: 2px solid var(--accent);
            outline-offset: 0;
            box-shadow: 0 0 0 2px rgba(50,255,170,0.25), 0 2px 10px rgba(0,0,0,0.35);
        }
        .x-buttons .btn-x:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .x-buttons .btn-x:disabled { opacity: .6; cursor: not-allowed; }
    </style>
</head>
<body>
<div class="shell">
    <header class="main-header">
        <h1 class="header-title">Лабораторная работа №2</h1>
        <div class="header-meta">
            <span>Студент: <strong>Абрамова Анастасия Сергеевна</strong></span>
            <span>Группа: <strong>P3211</strong></span>
            <span>Вариант: <strong>464906</strong></span>
        </div>
        <!-- Кнопка перехода к странице статистики заголовков -->
        <a class="btn" href="${pageContext.request.contextPath}/stats">Статистика заголовков</a>
    </header>

    <div class="main-grid">
        <section class="pane">
            <h2>Ввод данных</h2>
            <form id="control-form" method="POST" action="${pageContext.request.contextPath}/controller">
                <input type="hidden" id="x-hidden" name="x" />
                <input type="hidden" id="source-hidden" name="source" value="form" />
                <input type="hidden" id="client-time" name="clientTime" />

                <div class="form-row">
                    <label>X (кнопки и клик по графику)</label>
                    <div class="inline-wrap x-buttons" id="x-buttons">
                        <button type="button" class="btn-x" data-x="-4">-4</button>
                        <button type="button" class="btn-x" data-x="-3">-3</button>
                        <button type="button" class="btn-x" data-x="-2">-2</button>
                        <button type="button" class="btn-x" data-x="-1">-1</button>
                        <button type="button" class="btn-x" data-x="0">0</button>
                        <button type="button" class="btn-x" data-x="1">1</button>
                        <button type="button" class="btn-x" data-x="2">2</button>
                        <button type="button" class="btn-x" data-x="3">3</button>
                        <button type="button" class="btn-x" data-x="4">4</button>
                    </div>
                    <div class="note">Клик по графику отправляет координаты как есть (без «магнитовки»).</div>
                </div>

                <div class="form-row">
                    <label for="y-input">Y (-3 &lt; Y &lt; 5) <span>вещественное</span></label>
                    <div class="inline-wrap">
                        <input type="text" id="y-input" name="y" maxlength="32" inputmode="decimal" placeholder="пример: 1.25">
                    </div>
                    <div class="note">Границы не включительно. Не более 5 знаков после запятой.</div>
                </div>

                <div class="form-row">
                    <label>R (можно несколько)</label>
                    <div class="inline-wrap" id="r-block">
                        <label class="inline-label"><input type="checkbox" name="r" value="1">1</label>
                        <label class="inline-label"><input type="checkbox" name="r" value="1.5">1.5</label>
                        <label class="inline-label"><input type="checkbox" name="r" value="2">2</label>
                        <label class="inline-label"><input type="checkbox" name="r" value="2.5">2.5</label>
                        <label class="inline-label"><input type="checkbox" name="r" value="3" checked>3</label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn">Проверить</button>
                </div>
            </form>
        </section>

        <section class="pane alt">
            <h2>График областей</h2>
            <div class="graph-wrapper">
                <div id="graph">
                    <svg id="plane" viewBox="-6 -6 12 12" aria-label="Плоскость координат">
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                <path d="M0 0 L10 5 L0 10 z" fill="var(--axis)"></path>
                            </marker>
                        </defs>
                        <g class="grid-minor" id="grid-minor"></g>
                        <g class="grid-major" id="grid-major"></g>
                        <g id="geom" transform="scale(1,-1)">
                            <g id="figures"></g>
                            <g id="axes">
                                <line class="axis" x1="-6" y1="0" x2="6" y2="0"></line>
                                <line class="axis" x1="0" y1="-6" x2="0" y2="6"></line>
                            </g>
                            <g id="ticks"></g>
                            <g id="labels" transform="scale(1,-1)"></g>
                            <g class="points" id="points" transform="scale(1,-1)"></g>
                        </g>
                    </svg>
                </div>
                <div class="legend">
                    <span><i style="background:rgba(53,210,123,0.6)"></i> Треугольник (III)</span>
                    <span><i style="background:rgba(42,184,255,0.6)"></i> Четверть круга (I)</span>
                    <span><i style="background:rgba(255,179,71,0.6)"></i> Прямоугольник (IV)</span>
                </div>
                <div class="footer-note">Масштаб = max выбранный R. Ось Y направлена вверх (математическая).</div>
            </div>
        </section>

        <section class="pane table-block">
            <h2>Результаты прошлых запросов (сессия)</h2>
            <table class="data-grid" id="result-table">
                <thead>
                <tr><th>X</th><th>Y</th><th>R</th><th>Hit</th><th>Время пользователя</th><th>Время (нс)</th></tr>
                </thead>
                <tbody>
                <%
                    @SuppressWarnings("unchecked")
                    List<HitResult> list = (List<HitResult>) session.getAttribute("resultsList");
                    if (list != null) {
                        for (int i = 0; i < list.size(); i++) {
                            HitResult row = list.get(i);
                %>
                <tr>
                    <td><%= row.getX() %></td>
                    <td><%= row.getY() %></td>
                    <td><%= row.getR() %></td>
                    <td style="color:<%= row.isHit() ? "#2dff9a" : "#ff8070" %>;font-weight:600"><%= row.isHit() ? "Да" : "Нет" %></td>
                    <td><%= row.getClientTime() == null ? "" : row.getClientTime() %></td>
                    <td><%= row.getExecTimeNs() %></td>
                </tr>
                <%
                        }
                    }
                %>
                </tbody>
            </table>
        </section>
    </div>
</div>

<div id="toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true"></div>
<script>
    document.addEventListener('keydown', e => {
        if (e.altKey && e.key.toLowerCase() === 'g') {
            document.body.classList.toggle('bg-debug');
        }
    });
</script>
<script src="${pageContext.request.contextPath}/static/app.js?v=hist3"></script>
</body>
</html>