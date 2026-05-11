package com.nearscop.demo.client;

import com.nearscop.demo.exception.NasaApiException;
import com.nearscop.demo.model.NasaAsteroid;
import com.nearscop.demo.model.NasaAsteroidResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Component
public class NasaApiClient {

    private final WebClient webClient;
    private final String apiKey;

    public NasaApiClient(WebClient.Builder webClientBuilder,
                         @Value("${nasa.api.base-url:https://api.nasa.gov/neo/rest/v1}") String baseUrl,
                         @Value("${nasa.api.key:DEMO_KEY}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public List<NasaAsteroid> getAsteroidsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching asteroids from NASA API for date range: {} to {}", startDate, endDate);

        NasaAsteroidResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/feed")
                        .queryParam("start_date", startDate.toString())
                        .queryParam("end_date", endDate.toString())
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(NasaAsteroidResponse.class)
                .onErrorMap(ex -> new NasaApiException("Failed to fetch asteroids from NASA API", ex))
                .block();

        List<NasaAsteroid> asteroids = new ArrayList<>();
        if (response != null && response.getNearEarthObjects() != null) {
            response.getNearEarthObjects().values().forEach(asteroids::addAll);
        }

        log.info("Retrieved {} asteroids from NASA API", asteroids.size());
        return asteroids;
    }

    public NasaAsteroid getAsteroidById(String id) {
        log.info("Fetching asteroid with id {} from NASA API", id);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/neo/{id}")
                        .queryParam("api_key", apiKey)
                        .build(id))
                .retrieve()
                .bodyToMono(NasaAsteroid.class)
                .onErrorMap(ex -> new NasaApiException("Failed to fetch asteroid with id: " + id, ex))
                .block();
    }

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(NasaApiClient.class);
}
