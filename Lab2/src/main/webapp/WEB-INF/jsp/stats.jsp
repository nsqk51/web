<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.*" %>
<%@ page import="ru.nsqk.web.stats.StatItem" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Статистика HTTP-заголовков</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
        :root {
            --bg-body: #031c10;
            --accent: #2ddc7d;
            --text: #e9ffee;
            --muted: #8ab59b;
            --radius: 15px;
        }
        html, body { margin:0; padding:0; }
        body {
            font-family: "Inter", system-ui, sans-serif;
            min-height:100vh;
            color: var(--text);
            background:
                    linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.42)),
                    url("<%= request.getContextPath() %>/media/fzt2.gif") center/cover fixed no-repeat,
                    var(--bg-body);
        }
        .shell { max-width:1250px; margin:0 auto; padding:26px 24px 48px; display:flex; flex-direction:column; gap:26px; }
        header.main-header {
            background:linear-gradient(135deg,rgba(30,120,70,0.32),rgba(20,90,55,0.42));
            border:1px solid rgba(90,255,170,0.30);
            border-radius: var(--radius);
            padding:24px 28px;
            display:flex; align-items:center; justify-content:space-between; gap:28px; flex-wrap:wrap;
            backdrop-filter: blur(10px) saturate(1.15);
            box-shadow:0 4px 18px -6px rgba(0,0,0,0.55),0 0 0 1px rgba(70,200,130,0.08);
        }
        .header-title { font-size:2rem; margin:0; color:#cffff0; }
        .pane {
            background:rgba(10,55,30,0.32);
            border:1px solid rgba(90,255,170,0.30);
            border-radius: var(--radius);
            padding:20px 22px 26px;
            backdrop-filter: blur(12px) saturate(1.25);
            box-shadow:0 6px 22px -8px rgba(0,0,0,0.65),0 0 0 1px rgba(70,200,130,0.12);
        }
        h2 { margin:0 0 12px; font-size:1.1rem; letter-spacing:.5px; text-transform:uppercase; color:#d9ffe4; }
        table.data-grid {
            width:100%; border-collapse:collapse; font-size:0.9rem;
            border:1px solid rgba(90,210,140,0.35); border-radius:16px; overflow:hidden;
            background:rgba(0,40,20,0.25); backdrop-filter: blur(6px);
        }
        .data-grid thead th {
            background:linear-gradient(180deg,rgba(40,160,95,0.50),rgba(30,120,70,0.50));
            font-weight:600; padding:9px 7px; text-align:center; color:#e4ffef;
            border-bottom:1px solid rgba(100,230,160,0.4); letter-spacing:.45px; font-size:0.8rem;
        }
        .data-grid tbody td { padding:8px 7px; text-align:center; border-top:1px solid rgba(80,170,120,0.22); color:#d4ffe3; }
        .data-grid tbody tr:nth-child(even) td { background:rgba(30,90,55,0.14); }
        .actions { margin-top:14px; display:flex; gap:12px; }
        a.btn {
            display:inline-block; background:linear-gradient(145deg,#15884a,#0d6a39);
            color:#e6ffe9; border:1px solid rgba(100,255,170,0.35); padding:10px 16px; border-radius:10px;
            text-decoration:none; font-weight:600;
        }
    </style>
</head>
<body>
<div class="shell">
    <header class="main-header">
        <h1 class="header-title">Статистика HTTP‑заголовков</h1>
        <div class="actions">
            <a class="btn" href="<%= request.getContextPath() %>/controller">Назад к форме</a>
        </div>
    </header>

    <section class="pane">
        <h2>Сводная таблица</h2>
        <table class="data-grid">
            <thead>
            <tr><th>Заголовок</th><th>Количество</th></tr>
            </thead>
            <tbody>
            <%
                @SuppressWarnings("unchecked")
                List<StatItem> stats = (List<StatItem>) request.getAttribute("stats");
                if (stats != null && !stats.isEmpty()) {
                    for (StatItem it : stats) {
            %>
            <tr>
                <td><%= it.getName() %></td>
                <td><%= it.getCount() %></td>
            </tr>
            <%
                }
            } else {
            %>
            <tr><td colspan="2" style="text-align:center; color:#9dd9b8; padding:14px;">Пока нет данных. Откройте/используйте страницу формы.</td></tr>
            <% } %>
            </tbody>
        </table>
    </section>
</div>
</body>
</html>