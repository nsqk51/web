package ru.nsqk.web.stats;

import jakarta.inject.Inject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "StatsServlet", urlPatterns = {"/stats"})
public class StatsServlet extends HttpServlet {

    @Inject
    private HeaderStatsService stats;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<StatItem> snapshot = stats.snapshotSorted();
        req.setAttribute("stats", snapshot);
        req.getRequestDispatcher("/WEB-INF/jsp/stats.jsp").forward(req, resp);
    }
}