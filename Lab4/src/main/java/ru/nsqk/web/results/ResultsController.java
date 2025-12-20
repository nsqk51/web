// ResultsController.java
package ru.nsqk.web.results;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ru.nsqk.web.results.dto.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultsController {

    private final HitResultService service;

    public ResultsController(HitResultService service) {
        this.service = service;
    }

    @GetMapping
    public List<HitResultDto> all(Authentication authentication) {
        // Получаем имя пользователя из аутентификации
        String username = authentication.getName();
        return service.findAllForUser(username).stream()
                .sorted(Comparator.comparing(HitResult::getId).reversed())
                .map(this::toDto)
                .toList();
    }

    @PostMapping("/check")
    public ResponseEntity<HitResultDto> check(
            @RequestBody @Valid CheckRequest req,
            Authentication authentication
    ) {
        String username = authentication.getName();
        HitResult saved = service.checkAndSave(req, username);
        return ResponseEntity.ok(toDto(saved));
    }

    private HitResultDto toDto(HitResult h) {
        return new HitResultDto(
                h.getX(),
                h.getY(),
                h.getR(),
                h.isHit(),
                h.getServerTime(),
                h.getExecTimeNs()
        );
    }
}