package ru.nsqk.web.results;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
    public List<HitResultDto> all() {
        return service.findAllDesc().stream()
                .sorted(Comparator.comparing(HitResult::getId).reversed())
                .map(this::toDto)
                .toList();
    }

    @PostMapping("/check")
    public ResponseEntity<HitResultDto> check(@RequestBody @Valid CheckRequest req) {
        HitResult saved = service.checkAndSave(req);
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