package com.nearscop.demo.dto;

public record AsteroidStatsDto(
        long totalAsteroids,
        long hazardousAsteroids,
        double avgVelocityKmh,
        double avgMissDistanceKm,
        double avgDangerScore,
        int maxDangerScore
) {}
