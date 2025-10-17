<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List" %>
<%@ page import="ru.nsqk.web.model.HitResult" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Результат проверки</title>
    <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#0b1b12; color:#eafff1; margin:0; padding:24px; }
        .card { max-width:1000px; margin:0 auto; background:rgba(10,55,30,0.32); border:1px solid rgba(90,255,170,0.30); border-radius:14px; padding:18px 20px; }
        h1 { margin:6px 0 14px; font-size:1.35rem; color:#ceffe7; }
        table { width:100%; border-collapse:collapse; background:rgba(0,40,20,0.25); border:1px solid rgba(90,210,140,0.35); border-radius:12px; overflow:hidden; }
        thead th{ background:linear-gradient(180deg,rgba(40,160,95,0.50),rgba(30,120,70,0.50)); padding:8px; font-weight:600; text-align:center; font-size:0.9rem; }
        tbody td{ padding:8px; text-align:center; border-top:1px solid rgba(80,170,120,0.22); }
        .ok { color:#2dff9a; font-weight:600; }
        .bad { color:#ff8070; font-weight:600; }
        .actions { margin-top:14px; display:flex; gap:10px; }
        a.btn { display:inline-block; padding:10px 16px; border-radius:10px; color:#eafff1; text-decoration:none; background:linear-gradient(145deg,#15884a,#0d6a39); border:1px solid rgba(100,255,170,0.35); }
        .error { padding:12px; margin-bottom:12px; border:1px solid rgba(255,120,120,0.4); background:rgba(90,30,30,0.4); border-radius:10px; color:#ffdede; }
        .kv { font-size:0.9rem; color:#cfeee0; margin:10px 0 14px; }
        .kv span{ color:#9ad7b6; }
    </style>
</head>
<body>
<div class="card">
    <h1>Результат проверки попадания точки</h1>

    <%
        String error = (String) request.getAttribute("errorMessage");
        String rawX = (String) request.getAttribute("rawX");
        String rawY = (String) request.getAttribute("rawY");
        String[] rawR = (String[]) request.getAttribute("rawR");
        String rawSource = (String) request.getAttribute("rawSource");
        String rawClientTime = (String) request.getAttribute("rawClientTime");
        if (error != null && !error.isBlank()) {
    %>
    <div class="error">Ошибка: <%= error %></div>
    <div class="kv">
        Принятые параметры:
        x=<span><%= rawX == null ? "" : rawX %></span>,
        y=<span><%= rawY == null ? "" : rawY %></span>,
        r=<span>
        <%
            if (rawR != null) {
                for (int i = 0; i < rawR.length; i++) {
                    out.print(rawR[i]);
                    if (i + 1 < rawR.length) out.print(", ");
                }
            }
        %>
        </span>,
        source=<span><%= rawSource == null ? "" : rawSource %></span>,
        time=<span><%= rawClientTime == null ? "" : rawClientTime %></span>
    </div>
    <% } %>

    <%
        List<HitResult> last = (List<HitResult>) request.getAttribute("lastResults");
        if (last != null && !last.isEmpty()) {
    %>
    <table>
        <thead>
        <tr><th>X</th><th>Y</th><th>R</th><th>Попадание</th><th>Время пользователя</th><th>Время (нс)</th></tr>
        </thead>
        <tbody>
        <%
            for (HitResult row : last) {
        %>
        <tr>
            <td><%= row.getX() %></td>
            <td><%= row.getY() %></td>
            <td><%= row.getR() %></td>
            <td class="<%= row.isHit() ? "ok" : "bad" %>"><%= row.isHit() ? "Да" : "Нет" %></td>
            <td><%= row.getClientTime() == null ? "" : row.getClientTime() %></td>
            <td><%= row.getExecTimeNs() %></td>
        </tr>
        <%
            }
        %>
        </tbody>
    </table>
    <% } %>

    <div class="actions">
        <a class="btn" href="${pageContext.request.contextPath}/controller">Назад к форме</a>
    </div>
</div>
</body>
</html>