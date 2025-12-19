package ru.nsqk.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({"/app", "/app/**"})
    public String forwardApp() {
        return "forward:/index.html";
    }
}