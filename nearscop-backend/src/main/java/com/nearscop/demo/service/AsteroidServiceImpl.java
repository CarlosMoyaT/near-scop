package com.nearscop.demo.service;

import com.nearscop.demo.client.NasaApiClient;
import com.nearscop.demo.dto.AsteroidDto;
import com.nearscop.demo.dto.AsteroidStatsDto;
import com.nearscop.demo.exception.NasaApiException;
import com.nearscop.demo.model.NasaAsteroid;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class AsteroidServiceImpl implements AsteroidService {

    private final NasaApiClient nasaApiClient;

    public AsteroidServiceImpl(NasaApiClient nasaApiClient) {
        this.nasaApiClient = nasaApiClient;
    }

    @Cacheable(value = "asteroids", key = "#startDate + '_' + #endDate")
    public List<AsteroidDto> getAsteroidsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching asteroids for date range: {} to {}", startDate, endDate);
        try {
            List<NasaAsteroid> nasaAsteroids = nasaApiClient.getAsteroidsByDateRange(startDate, endDate);
            return nasaAsteroids.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new NasaApiException("Failed to fetch asteroids from NASA API", e);
        }
    }

    public AsteroidDto getAsteroidById(String id) {
        log.info("Fetching asteroid with id: {}", id);
        try {
            NasaAsteroid nasaAsteroid = nasaApiClient.getAsteroidById(id);
            return convertToDto(nasaAsteroid);
        } catch (Exception e) {
            throw new NasaApiException("Failed to fetch asteroid by id: " + id, e);
        }
    }

    public List<AsteroidDto> getAsteroidsForToday() {
        LocalDate today = LocalDate.now();
        return getAsteroidsByDateRange(today, today);
    }

    public AsteroidStatsDto getAsteroidStats(LocalDate startDate, LocalDate endDate) {
        List<AsteroidDto> asteroids = getAsteroidsByDateRange(startDate, endDate);

        if (asteroids.isEmpty()) {
            return new AsteroidStatsDto(0, 0, 0, 0, 0, 0);
        }

        double avgVelocity = asteroids.stream().mapToDouble(AsteroidDto::velocityKmh).average().orElse(0);
        double avgDistance = asteroids.stream().mapToDouble(AsteroidDto::missDistanceKm).average().orElse(0);
        double avgDanger = asteroids.stream().mapToInt(AsteroidDto::dangerScore).average().orElse(0);
        int maxDanger = asteroids.stream().mapToInt(AsteroidDto::dangerScore).max().orElse(0);
        long hazardousCount = asteroids.stream().filter(AsteroidDto::isHazardous).count();

        return new AsteroidStatsDto(
                asteroids.size(),
                hazardousCount,
                avgVelocity,
                avgDistance,
                avgDanger,
                maxDanger
        );
    }

    private AsteroidDto convertToDto(NasaAsteroid nasaAsteroid) {
        NasaAsteroid.CloseApproachData closestApproach = nasaAsteroid.getCloseApproachData().stream()
                .min(Comparator.comparing(data -> Double.parseDouble(data.getMissDistance().getKilometers())))
                .orElse(null);

        double minDiameter = nasaAsteroid.getEstimatedDiameter().getKilometers().getMin();
        double maxDiameter = nasaAsteroid.getEstimatedDiameter().getKilometers().getMax();
        double velocity = closestApproach != null ? Double.parseDouble(closestApproach.getRelativeVelocity().getKilometersPerHour()) : 0;
        double distance = closestApproach != null ? Double.parseDouble(closestApproach.getMissDistance().getKilometers()) : 0;
        int dangerScore = calculateDangerScore(velocity, distance, maxDiameter, nasaAsteroid.isPotentiallyHazardous());

        return new AsteroidDto(
                nasaAsteroid.getId(),
                nasaAsteroid.getName(),
                minDiameter,
                maxDiameter,
                velocity,
                distance,
                nasaAsteroid.isPotentiallyHazardous(),
                dangerScore,
                closestApproach != null ? closestApproach.getCloseApproachDate() : null
        );
    }

    private int calculateDangerScore(double velocity, double distance, double diameter, boolean isHazardous) {
        int score = 0;

        if (velocity > 50000) score += 30;
        else if (velocity > 25000) score += 20;
        else if (velocity > 10000) score += 10;

        if (distance < 1000000) score += 40;
        else if (distance < 5000000) score += 25;
        else if (distance < 20000000) score += 10;

        if (diameter > 1.0) score += 30;
        else if (diameter > 0.5) score += 20;
        else if (diameter > 0.1) score += 10;

        if (isHazardous) score += 20;

        return Math.min(score, 100);
    }

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(AsteroidServiceImpl.class);
}
