package ru.nsqk.web.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "ControllerServlet", urlPatterns = {"/controller"})
public class ControllerServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // Любой GET -> на форму
        req.getRequestDispatcher("/WEB-INF/jsp/index.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // До forward: кодировка и принудительный парсинг параметров POST
        if (req.getCharacterEncoding() == null) {
            req.setCharacterEncoding("UTF-8");
        }
        req.getParameterMap();
        // Любой POST -> в AreaCheckServlet
        req.getRequestDispatcher("/area").forward(req, resp);
    }
}