package com.nearscop.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;


public class NasaAsteroidResponse {
    @JsonProperty("near_earth_objects")
    private Map<String, List<NasaAsteroid>> nearEarthObjects;
    private Links links;
    private int elementCount;

    @Data
    public static class Links {
        private String next;
        private String prev;
        private String self;
    }

    public Map<String, List<NasaAsteroid>> getNearEarthObjects() {
        return nearEarthObjects;
    }

    public Links getLinks() {
        return links;
    }

    public int getElementCount() {
        return elementCount;
    }
}
