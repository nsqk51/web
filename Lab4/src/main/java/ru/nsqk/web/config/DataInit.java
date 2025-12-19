package ru.nsqk.web.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import ru.nsqk.web.user.UserService;

@Configuration
public class DataInit implements ApplicationRunner {

    private final UserService userService;

    public DataInit(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(ApplicationArguments args) {
        // демо-пользователь, чтобы можно было войти сразу
        userService.ensureUserExists("user", "user");
    }
}