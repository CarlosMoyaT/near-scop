package com.nearscop.demo.service;

import com.nearscop.demo.dto.AsteroidDto;
import com.nearscop.demo.dto.AsteroidStatsDto;

import java.time.LocalDate;
import java.util.List;

public interface AsteroidService {

    List<AsteroidDto> getAsteroidsByDateRange(LocalDate startDate, LocalDate endDate);

    AsteroidDto getAsteroidById(String id);

    List<AsteroidDto> getAsteroidsForToday();

    AsteroidStatsDto getAsteroidStats(LocalDate startDate, LocalDate endDate);
}
