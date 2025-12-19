package ru.nsqk.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

@Configuration
public class WebSecurityStaticConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/", "/index.html",
                "/favicon.ico",
                "/assets/**",
                "/*.css", "/*.js",
                "/manifest.json",
                "/robots.txt"
        );
    }
}