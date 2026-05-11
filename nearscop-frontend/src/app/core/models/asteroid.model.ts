export interface Asteroid {
  id: string;
  name: string;
  nasaJplUrl: string;
  absoluteMagnitudeH: number;
  estimatedDiameter: {
    kilometers: { min: number; max: number };
    meters: { min: number; max: number };
  };
  isPotentiallyHazardousAsteroid: boolean;
  closeApproachData: CloseApproachData[];
  dangerScore: number;
}

export interface CloseApproachData {
  closeApproachDate: string;
  relativeVelocity: { kilometersPerSecond: string; kilometersPerHour: string };
  missDistance: { astronomical: string; lunar: string; kilometers: string };
  orbitingBody: string;
}

export interface AsteroidDetail extends Asteroid {
  orbitalData?: OrbitalData;
}

export interface OrbitalData {
  orbitDeterminationDate: string;
  orbitUncertainty: string;
  minimumOrbitIntersectionDistance: string;
  jupiterTisserandInvariant: string;
  epochOsculation: string;
  eccentricity: string;
  semiMajorAxis: string;
  inclination: string;
  ascendingNodeLongitude: string;
  orbitalPeriod: string;
  perihelionDistance: string;
  perihelionArgument: string;
  aphelionDistance: string;
  perihelionTime: string;
  meanAnomaly: string;
  meanMotion: string;
  equinox: string;
  orbitClass: OrbitClass;
}

export interface OrbitClass {
  orbitClassType: string;
  orbitClassDescription: string;
  orbitClassRange: string;
}

export interface AsteroidStats {
  totalAsteroids: number;
  hazardousCount: number;
  averageVelocity: number;
  closestDistance: number;
  largestDiameter: number;
  topHazardous: Asteroid[];
}

export interface NasaNeoResponse {
  nearEarthObjects: { [date: string]: Asteroid[] };
  elementCount: number;
}
