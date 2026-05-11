package com.nearscop.demo.dto;

public record AsteroidDto(
        String id,
        String name,
        double minDiameterKm,
        double maxDiameterKm,
        double velocityKmh,
        double missDistanceKm,
        boolean isHazardous,
        int dangerScore,
        String closeApproachDate
) {}
