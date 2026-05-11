import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Asteroid, AsteroidDetail, AsteroidStats } from '../models/asteroid.model';

@Injectable({
  providedIn: 'root'
})
export class AsteroidService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.nasaApiUrl}/feed`;

  getAsteroidsByDateRange(startDate: string, endDate: string): Observable<Asteroid[]> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('api_key', environment.nasaApiKey);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response: any) => {
        const asteroids: Asteroid[] = [];
        const nearEarthObjects = response.near_earth_objects || response.nearEarthObjects || {};
        Object.values(nearEarthObjects).forEach((dayAsteroids: unknown) => {
          if (Array.isArray(dayAsteroids)) {
            dayAsteroids.forEach((asteroid: any) => {
              const mappedAsteroid = this.mapAsteroid(asteroid);
              asteroids.push(mappedAsteroid);
            });
          }
        });
        return asteroids;
      })
    );
  }

  getAsteroidById(id: string): Observable<AsteroidDetail> {
    const params = new HttpParams().set('api_key', environment.nasaApiKey);
    return this.http.get<any>(`${environment.nasaApiUrl}/neo/${id}`, { params }).pipe(
      map((asteroid: any) => this.mapAsteroid(asteroid) as AsteroidDetail)
    );
  }

  getAsteroidsToday(): Observable<Asteroid[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAsteroidsByDateRange(today, today);
  }

  getAsteroidStats(asteroids: Asteroid[]): AsteroidStats {
    const hazardous = asteroids.filter(a => a.isPotentiallyHazardousAsteroid);
    const velocities = asteroids.map(a => parseFloat(a.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond || '0'));
    const distances = asteroids.map(a => parseFloat(a.closeApproachData?.[0]?.missDistance?.kilometers || '0'));
    const diameters = asteroids.map(a => a.estimatedDiameter?.kilometers?.max || 0);

    return {
      totalAsteroids: asteroids.length,
      hazardousCount: hazardous.length,
      averageVelocity: velocities.reduce((a, b) => a + b, 0) / velocities.length || 0,
      closestDistance: Math.min(...distances) || 0,
      largestDiameter: Math.max(...diameters) || 0,
      topHazardous: hazardous.sort((a, b) => b.dangerScore - a.dangerScore).slice(0, 5)
    };
  }

  calculateDangerScore(asteroid: Asteroid): number {
    let score = 0;
    if (asteroid.isPotentiallyHazardousAsteroid) score += 50;
    const distance = parseFloat(asteroid.closeApproachData?.[0]?.missDistance?.kilometers || '999999999');
    const velocity = parseFloat(asteroid.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond || '0');
    const diameter = asteroid.estimatedDiameter?.kilometers?.max || 0;
    score += Math.min(30, (10000000 / distance) * 10);
    score += Math.min(20, velocity * 2);
    score += Math.min(10, diameter * 100);
    return Math.min(100, Math.round(score));
  }

  private mapAsteroid(asteroid: any): Asteroid {
    const mapped: Asteroid = {
      id: asteroid.id || asteroid.neo_reference_id || '',
      name: asteroid.name || '',
      nasaJplUrl: asteroid.nasa_jpl_url || asteroid.nasaJplUrl || '',
      absoluteMagnitudeH: asteroid.absolute_magnitude_h || asteroid.absoluteMagnitudeH || 0,
      estimatedDiameter: {
        kilometers: {
          min: asteroid.estimated_diameter?.kilometers?.min || asteroid.estimatedDiameter?.kilometers?.min || 0,
          max: asteroid.estimated_diameter?.kilometers?.max || asteroid.estimatedDiameter?.kilometers?.max || 0
        },
        meters: {
          min: asteroid.estimated_diameter?.meters?.min || asteroid.estimatedDiameter?.meters?.min || 0,
          max: asteroid.estimated_diameter?.meters?.max || asteroid.estimatedDiameter?.meters?.max || 0
        }
      },
      isPotentiallyHazardousAsteroid: asteroid.is_potentially_hazardous_asteroid || asteroid.isPotentiallyHazardousAsteroid || false,
      closeApproachData: (asteroid.close_approach_data || asteroid.closeApproachData || []).map((cad: any) => ({
        closeApproachDate: cad.close_approach_date || cad.closeApproachDate || '',
        relativeVelocity: {
          kilometersPerSecond: cad.relative_velocity?.kilometers_per_second || cad.relativeVelocity?.kilometersPerSecond || '0',
          kilometersPerHour: cad.relative_velocity?.kilometers_per_hour || cad.relativeVelocity?.kilometersPerHour || '0'
        },
        missDistance: {
          astronomical: cad.miss_distance?.astronomical || cad.missDistance?.astronomical || '0',
          lunar: cad.miss_distance?.lunar || cad.missDistance?.lunar || '0',
          kilometers: cad.miss_distance?.kilometers || cad.missDistance?.kilometers || '0'
        },
        orbitingBody: cad.orbiting_body || cad.orbitingBody || ''
      })),
      dangerScore: 0
    };
    mapped.dangerScore = this.calculateDangerScore(mapped);
    return mapped;
  }
}
