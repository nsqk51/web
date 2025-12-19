package ru.nsqk.web.results;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.nsqk.web.results.dto.CheckRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class HitResultService {

    // Читаемый формат: 2025-12-18 14:30:00
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final HitResultRepository repo;

    public HitResultService(HitResultRepository repo) {
        this.repo = repo;
    }

    public List<HitResult> findAllDesc() {
        return repo.findAll();
    }

    @Transactional
    public HitResult checkAndSave(CheckRequest req) {
        validate(req);

        HitResult hr = new HitResult();
        hr.setX(req.getX());
        hr.setY(req.getY());
        hr.setR(req.getR());

        long start = System.nanoTime();
        hr.checkHit();

        // Сохраняем локальное время сервера в красивом формате
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

        // X: разрешаем дробные (для клика по графику), но в пределах [-4..4]
        if (x < -4 || x > 4) {
            throw new IllegalArgumentException("X должен быть в диапазоне [-4..4]");
        }

        // Y: строго (-5; 5)
        if (!(y > -5 && y < 5)) {
            throw new IllegalArgumentException("Y должен быть строго в интервале (-5; 5)");
        }

        // R: строго положительный
        if (r <= 0) {
            throw new IllegalArgumentException("Радиус должен быть положительным");
        }
        if (r > 4) {
            throw new IllegalArgumentException("R не может быть больше 4");
        }
    }
}