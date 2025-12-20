package ru.nsqk.web.auth;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.nsqk.web.user.UserService;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserService userService;

    public JwtAuthFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        String requestPath = request.getRequestURI();

        log.debug("JWT Filter - Path: {}, Auth header: {}", requestPath, header);

        if (header == null || !header.startsWith("Bearer ")) {
            log.debug("No Bearer token found");
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring("Bearer ".length());
        log.debug("Token extracted, length: {}", token.length());

        if (!jwtService.isValid(token)) {
            log.warn("Invalid JWT token");
            chain.doFilter(request, response);
            return;
        }

        String username = jwtService.extractUsername(token);
        log.debug("Valid token for user: {}", username);

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = userService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    user, null, user.getAuthorities()
            );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            log.debug("Authentication set for user: {}", username);
        }

        chain.doFilter(request, response);
    }
}