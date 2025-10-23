package ru.nsqk.web.stats;

import jakarta.enterprise.inject.spi.CDI;
import jakarta.inject.Inject;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Фильтр считает заголовки для запросов к контроллеру.
 * Логика подсчёта вынесена в HeaderStatsService.
 */
@WebFilter(urlPatterns = {"/controller"})
public class HeaderCountingFilter implements Filter {

    @Inject
    private HeaderStatsService stats;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HeaderStatsService svc = stats;
        if (svc == null) {
            // fallback на случай, если контейнер не заинжектил по каким-то причинам
            svc = CDI.current().select(HeaderStatsService.class).get();
        }
        if (request instanceof HttpServletRequest httpReq) {
            svc.recordHeaders(httpReq);
        }
        chain.doFilter(request, response);
    }
}