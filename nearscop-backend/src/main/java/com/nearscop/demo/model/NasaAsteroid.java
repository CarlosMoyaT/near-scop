package com.nearscop.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class NasaAsteroid {
    private String id;
    private String name;

    @JsonProperty("absolute_magnitude_h")
    private double absoluteMagnitudeH;

    @JsonProperty("estimated_diameter")
    private EstimatedDiameter estimatedDiameter;

    @JsonProperty("is_potentially_hazardous_asteroid")
    private boolean potentiallyHazardous;

    @JsonProperty("close_approach_data")
    private List<CloseApproachData> closeApproachData;

    @JsonProperty("nasa_jpl_url")
    private String nasaJplUrl;

    public String getId() { return id; }
    public String getName() { return name; }
    public double getAbsoluteMagnitudeH() { return absoluteMagnitudeH; }
    public EstimatedDiameter getEstimatedDiameter() { return estimatedDiameter; }
    public boolean isPotentiallyHazardous() { return potentiallyHazardous; }
    public List<CloseApproachData> getCloseApproachData() { return closeApproachData; }
    public String getNasaJplUrl() { return nasaJplUrl; }

    public static class EstimatedDiameter {
        @JsonProperty("kilometers")
        private DiameterRange kilometers;
        @JsonProperty("meters")
        private DiameterRange meters;

        public DiameterRange getKilometers() { return kilometers; }
        public DiameterRange getMeters() { return meters; }
    }

    public static class DiameterRange {
        @JsonProperty("estimated_diameter_min")
        private double min;
        @JsonProperty("estimated_diameter_max")
        private double max;

        public double getMin() { return min; }
        public double getMax() { return max; }
    }

    public static class CloseApproachData {
        @JsonProperty("close_approach_date")
        private String closeApproachDate;

        @JsonProperty("close_approach_date_full")
        private String closeApproachDateFull;

        @JsonProperty("relative_velocity")
        private Velocity relativeVelocity;

        @JsonProperty("miss_distance")
        private Distance missDistance;

        @JsonProperty("orbiting_body")
        private String orbitingBody;

        public String getCloseApproachDate() { return closeApproachDate; }
        public String getCloseApproachDateFull() { return closeApproachDateFull; }
        public Velocity getRelativeVelocity() { return relativeVelocity; }
        public Distance getMissDistance() { return missDistance; }
        public String getOrbitingBody() { return orbitingBody; }
    }

    public static class Velocity {
        @JsonProperty("kilometers_per_second")
        private String kilometersPerSecond;

        @JsonProperty("kilometers_per_hour")
        private String kilometersPerHour;

        public String getKilometersPerSecond() { return kilometersPerSecond; }
        public String getKilometersPerHour() { return kilometersPerHour; }
    }

    public static class Distance {
        @JsonProperty("astronomical")
        private String astronomical;

        @JsonProperty("lunar")
        private String lunar;

        @JsonProperty("kilometers")
        private String kilometers;

        @JsonProperty("miles")
        private String miles;

        public String getAstronomical() { return astronomical; }
        public String getLunar() { return lunar; }
        public String getKilometers() { return kilometers; }
        public String getMiles() { return miles; }
    }
}
