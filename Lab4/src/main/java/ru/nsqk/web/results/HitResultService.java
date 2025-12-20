// HitResultService.java
package ru.nsqk.web.results;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.nsqk.web.results.dto.CheckRequest;
import ru.nsqk.web.user.User;
import ru.nsqk.web.user.UserService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class HitResultService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final HitResultRepository repo;
    private final UserService userService;

    public HitResultService(HitResultRepository repo, UserService userService) {
        this.repo = repo;
        this.userService = userService;
    }

    // Получить все результаты для пользователя
    public List<HitResult> findAllForUser(String username) {
        User user = userService.findByUsername(username);
        return repo.findAllByUserOrderByIdDesc(user);
    }

    @Transactional
    public HitResult checkAndSave(CheckRequest req, String username) {
        validate(req);

        // Получаем пользователя
        User user = userService.findByUsername(username);

        HitResult hr = new HitResult();
        hr.setX(req.getX());
        hr.setY(req.getY());
        hr.setR(req.getR());
        hr.setUser(user); // Устанавливаем пользователя

        long start = System.nanoTime();
        hr.checkHit();

        hr.setServerTime(LocalDateTime.now().format(FORMATTER));
        hr.setExecTimeNs(System.nanoTime() - start);

        return repo.save(hr);
    }

    private void validate(CheckRequest req) {
        Double x = req.getX();
        Double y = req.getY();
        Double r = req.getR();

        if (x == null || y == null || r == null) {
            throw new IllegalArgumentException("Не заданы X, Y или R");
        }

        if (x < -4 || x > 4) {
            throw new IllegalArgumentException("X должен быть в диапазоне [-4..4]");
        }

        if (!(y > -5 && y < 5)) {
            throw new IllegalArgumentException("Y должен быть строго в интервале (-5; 5)");
        }

        if (r <= 0) {
            throw new IllegalArgumentException("Радиус должен быть положительным");
        }
        if (r > 4) {
            throw new IllegalArgumentException("R не может быть больше 4");
        }
    }
}