package ru.nsqk.web.controller;

import jakarta.inject.Inject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ru.nsqk.web.model.HitResult;
import ru.nsqk.web.model.ResultsBean;
import ru.nsqk.web.util.Geometry;
import ru.nsqk.web.util.Validation;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@WebServlet(name = "AreaCheckServlet", urlPatterns = {"/area"})
public class AreaCheckServlet extends HttpServlet {

    private static final Logger log = Logger.getLogger(AreaCheckServlet.class.getName());

    @Inject
    private ResultsBean resultsBean;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        handle(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        handle(req, resp);
    }

    private void handle(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        final String sx = req.getParameter("x");
        final String sy = req.getParameter("y");
        final String[] rVals = req.getParameterValues("r");
        final String clientTime = req.getParameter("clientTime");
        final String source = req.getParameter("source"); // "graph" | "form" | null
        final boolean fromGraph = "graph".equalsIgnoreCase(source) || "click".equalsIgnoreCase(source);

        log.info(() -> String.format("AreaCheck: source=%s x=%s y=%s r=%s clientTime=%s",
                source, sx, sy, rVals == null ? "null" : String.join(",", rVals), clientTime));

        // Пробросим «сырые» параметры для удобной диагностики на JSP
        req.setAttribute("rawX", sx);
        req.setAttribute("rawY", sy);
        req.setAttribute("rawR", rVals);
        req.setAttribute("rawSource", source);
        req.setAttribute("rawClientTime", clientTime);

        List<HitResult> batch = new ArrayList<>();

        try {
            if (sx == null || sy == null || rVals == null || rVals.length == 0) {
                throw new IllegalArgumentException("Не заданы обязательные параметры x, y или r");
            }

            final double x = fromGraph ? Validation.parseXFree(sx) : Validation.parseX(sx);
            final double y = fromGraph ? Validation.parseYFree(sy) : Validation.parseY(sy);
            final double[] rs = Validation.parseR(rVals);

            for (double r : rs) {
                long t0 = System.nanoTime();
                boolean hit = Geometry.isHit(x, y, r);
                long dt = System.nanoTime() - t0;
                HitResult hr = new HitResult(x, y, r, hit, clientTime, dt);
                batch.add(hr);
                resultsBean.add(hr);
            }

            // Сохраним успех
            req.setAttribute("lastResults", batch);
            req.removeAttribute("errorMessage");
        } catch (IllegalArgumentException ex) {
            String msg = ex.getMessage();
            if (msg == null || msg.isBlank()) msg = "Неизвестная ошибка валидации входных данных";
            req.setAttribute("errorMessage", msg);
            req.removeAttribute("lastResults");
            log.warning("Validation error: " + msg);
        } catch (Exception ex) {
            String msg = "Серверная ошибка: " + ex.getClass().getSimpleName();
            req.setAttribute("errorMessage", msg);
            req.removeAttribute("lastResults");
            log.severe(msg + " -> " + ex.getMessage());
        }

        // В любом случае положим актуальную историю в сессию для index.jsp (без JSTL/EL)
        try {
            req.getSession().setAttribute("resultsList", resultsBean.getAll());
        } catch (Exception ignore) {
            // если CDI вдруг не сработал, просто не будет истории
        }

        // Всегда показываем result.jsp
        req.getRequestDispatcher("/WEB-INF/jsp/result.jsp").forward(req, resp);
    }
}