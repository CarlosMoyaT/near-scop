package com.nearscop.demo.controller;

import com.nearscop.demo.dto.AsteroidDto;
import com.nearscop.demo.dto.AsteroidStatsDto;
import com.nearscop.demo.service.AsteroidService;
import jakarta.validation.constraints.NotNull;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/v1/asteroids")
public class AsteroidController {

    private final AsteroidService asteroidService;

    public AsteroidController(AsteroidService asteroidService) {
        this.asteroidService = asteroidService;
    }

    @GetMapping
    public ResponseEntity<List<AsteroidDto>> getAsteroidsByDateRange(
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("GET /api/v1/asteroids - startDate: {}, endDate: {}", startDate, endDate);
        List<AsteroidDto> asteroids = asteroidService.getAsteroidsByDateRange(startDate, endDate);
        return ResponseEntity.ok(asteroids);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsteroidDto> getAsteroidById(@PathVariable String id) {
        log.info("GET /api/v1/asteroids/{}", id);
        AsteroidDto asteroid = asteroidService.getAsteroidById(id);
        return ResponseEntity.ok(asteroid);
    }

    @GetMapping("/today")
    public ResponseEntity<List<AsteroidDto>> getAsteroidsForToday() {
        log.info("GET /api/v1/asteroids/today");
        List<AsteroidDto> asteroids = asteroidService.getAsteroidsForToday();
        return ResponseEntity.ok(asteroids);
    }

    @GetMapping("/stats")
    public ResponseEntity<AsteroidStatsDto> getAsteroidStats(
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("GET /api/v1/asteroids/stats - startDate: {}, endDate: {}", startDate, endDate);
        AsteroidStatsDto stats = asteroidService.getAsteroidStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Service is running");
    }

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(AsteroidController.class);
}

