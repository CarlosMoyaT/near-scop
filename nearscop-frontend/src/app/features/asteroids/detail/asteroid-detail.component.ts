import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsteroidService } from '../../../core/services/asteroid.service';
import { AsteroidDetail } from '../../../core/models/asteroid.model';

@Component({
  selector: 'app-asteroid-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <a routerLink="/asteroids" class="back-btn">← Back to List</a>

      <div *ngIf="loading" class="loading">Loading asteroid details...</div>

      <div *ngIf="!loading && asteroid" class="asteroid-detail">
        <header class="detail-header" [class.hazardous]="asteroid.isPotentiallyHazardousAsteroid">
          <h1>{{ asteroid.name }}</h1>
          <span class="danger-badge" [class]="getDangerClass(asteroid.dangerScore)">
            Danger Score: {{ asteroid.dangerScore }}/100
          </span>
        </header>

        <div class="detail-grid">
          <div class="info-card">
            <h2>Basic Information</h2>
            <div class="info-row">
              <span class="label">NASA JPL URL:</span>
              <a [href]="asteroid.nasaJplUrl" target="_blank">View on NASA</a>
            </div>
            <div class="info-row">
              <span class="label">Absolute Magnitude:</span>
              <span>{{ asteroid.absoluteMagnitudeH }}</span>
            </div>
            <div class="info-row">
              <span class="label">Potentially Hazardous:</span>
              <span [class]="asteroid.isPotentiallyHazardousAsteroid ? 'hazard-true' : 'hazard-false'">
                {{ asteroid.isPotentiallyHazardousAsteroid ? 'Yes ⚠️' : 'No' }}
              </span>
            </div>
          </div>

          <div class="info-card">
            <h2>Size Estimates</h2>
            <div class="info-row">
              <span class="label">Min Diameter (km):</span>
              <span>{{ asteroid.estimatedDiameter?.kilometers?.min | number:'1.3-3' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Max Diameter (km):</span>
              <span>{{ asteroid.estimatedDiameter?.kilometers?.max | number:'1.3-3' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Min Diameter (m):</span>
              <span>{{ asteroid.estimatedDiameter?.meters?.min | number:'1.1-1' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Max Diameter (m):</span>
              <span>{{ asteroid.estimatedDiameter?.meters?.max | number:'1.1-1' }}</span>
            </div>
          </div>

            <div class="info-card">
              <h2>Close Approach Data</h2>
              <div *ngIf="asteroid.closeApproachData && asteroid.closeApproachData.length > 0" class="approach-list">
                <div *ngFor="let approach of asteroid.closeApproachData" class="approach-item">
                <div class="info-row">
                  <span class="label">Date:</span>
                  <span>{{ approach.closeApproachDate }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Velocity (km/s):</span>
                  <span>{{ approach.relativeVelocity?.kilometersPerSecond | number:'1.1-1' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Miss Distance (km):</span>
                  <span>{{ approach.missDistance?.kilometers | number:'1.0-0' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Orbiting Body:</span>
                  <span>{{ approach.orbitingBody }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card" *ngIf="asteroid.orbitalData">
            <h2>Orbital Parameters</h2>
            <div class="info-row">
              <span class="label">Eccentricity:</span>
              <span>{{ asteroid.orbitalData.eccentricity }}</span>
            </div>
            <div class="info-row">
              <span class="label">Semi-Major Axis:</span>
              <span>{{ asteroid.orbitalData.semiMajorAxis }} AU</span>
            </div>
            <div class="info-row">
              <span class="label">Inclination:</span>
              <span>{{ asteroid.orbitalData.inclination }}°</span>
            </div>
            <div class="info-row">
              <span class="label">Orbital Period:</span>
              <span>{{ asteroid.orbitalData.orbitalPeriod }} days</span>
            </div>
            <div class="info-row">
              <span class="label">Orbit Class:</span>
              <span>{{ asteroid.orbitalData.orbitClass?.orbitClassType }}</span>
            </div>
            <div class="info-row">
              <span class="label">Orbit Description:</span>
              <span>{{ asteroid.orbitalData.orbitClass?.orbitClassDescription }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !asteroid" class="error">
        Asteroid not found.
      </div>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .back-btn { display: inline-block; margin-bottom: 20px; padding: 10px 20px; background: #1a1a2e; color: white; text-decoration: none; border-radius: 8px; }
    .detail-header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .detail-header.hazardous { border-left: 4px solid #e74c3c; }
    .detail-header h1 { font-size: 2rem; color: #1a1a2e; margin: 0; }
    .danger-badge { padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
    .danger-badge.high { background: #e74c3c; }
    .danger-badge.medium { background: #f39c12; }
    .danger-badge.low { background: #27ae60; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .info-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .info-card h2 { font-size: 1.3rem; color: #1a1a2e; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-row .label { color: #666; font-weight: 500; }
    .hazard-true { color: #e74c3c; font-weight: bold; }
    .hazard-false { color: #27ae60; }
    .approach-list { display: flex; flex-direction: column; gap: 15px; }
    .approach-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    .loading, .error { text-align: center; padding: 40px; color: #666; font-size: 1.1rem; }
  `]
})
export class AsteroidDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private asteroidService = inject(AsteroidService);
  asteroid: AsteroidDetail | null = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAsteroid(id);
    }
  }

  loadAsteroid(id: string) {
    this.asteroidService.getAsteroidById(id).subscribe({
      next: (data) => {
        this.asteroid = data;
        if (this.asteroid && data) {
          this.asteroid.dangerScore = this.asteroidService.calculateDangerScore(data as any);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading asteroid detail', err);
        this.loading = false;
      }
    });
  }

  getDangerClass(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
