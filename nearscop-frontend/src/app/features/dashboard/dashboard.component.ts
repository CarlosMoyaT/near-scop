import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsteroidService } from '../../core/services/asteroid.service';
import { Asteroid, AsteroidStats } from '../../core/models/asteroid.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>☄️ NearScop - Asteroid Tracking Dashboard</h1>
        <p>NASA Near Earth Object (NEO) Monitoring System</p>
      </header>

      <div *ngIf="loading" class="loading">Loading asteroid data...</div>

      <div *ngIf="!loading && stats" class="stats-grid">
        <div class="stat-card total">
          <h3>Total Asteroids</h3>
          <div class="stat-value">{{ stats.totalAsteroids }}</div>
        </div>
        <div class="stat-card hazardous">
          <h3>Potentially Hazardous</h3>
          <div class="stat-value">{{ stats.hazardousCount }}</div>
        </div>
        <div class="stat-card velocity">
          <h3>Avg. Velocity (km/s)</h3>
          <div class="stat-value">{{ stats.averageVelocity | number:'1.1-1' }}</div>
        </div>
        <div class="stat-card distance">
          <h3>Closest Distance (km)</h3>
          <div class="stat-value">{{ stats.closestDistance | number:'1.0-0' }}</div>
        </div>
      </div>

      <div *ngIf="hazardAlerts.length > 0" class="hazard-alerts">
        <h2>⚠️ Hazard Alerts</h2>
        <div *ngFor="let asteroid of hazardAlerts" class="alert-card">
          <div class="alert-header">
            <span class="alert-name">{{ asteroid.name }}</span>
            <span class="danger-score" [class]="getDangerClass(asteroid.dangerScore)">
              Danger: {{ asteroid.dangerScore }}/100
            </span>
          </div>
          <div class="alert-details">
            <span>Distance: {{ asteroid.closeApproachData?.[0]?.missDistance?.kilometers | number:'1.0-0' }} km</span>
            <span>Velocity: {{ asteroid.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond | number:'1.1-1' }} km/s</span>
            <span>Date: {{ asteroid.closeApproachData?.[0]?.closeApproachDate }}</span>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/asteroids" class="action-btn">View All Asteroids</a>
        <a routerLink="/stats" class="action-btn">View Statistics</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .dashboard-header { text-align: center; margin-bottom: 40px; }
    .dashboard-header h1 { font-size: 2.5rem; color: #1a1a2e; margin-bottom: 10px; }
    .dashboard-header p { color: #666; font-size: 1.1rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
    .stat-card h3 { color: #555; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 10px; }
    .stat-value { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
    .stat-card.hazardous .stat-value { color: #e74c3c; }
    .hazard-alerts { margin-bottom: 40px; }
    .hazard-alerts h2 { color: #e74c3c; margin-bottom: 20px; }
    .alert-card { background: #fff3cd; border-left: 4px solid #e74c3c; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
    .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .alert-name { font-weight: bold; font-size: 1.1rem; }
    .danger-score { padding: 5px 10px; border-radius: 5px; font-weight: bold; color: white; }
    .danger-score.high { background: #e74c3c; }
    .danger-score.medium { background: #f39c12; }
    .danger-score.low { background: #27ae60; }
    .alert-details { display: flex; gap: 20px; color: #666; font-size: 0.9rem; }
    .quick-actions { text-align: center; }
    .action-btn { display: inline-block; margin: 10px; padding: 15px 30px; background: #1a1a2e; color: white; text-decoration: none; border-radius: 8px; transition: background 0.3s; }
    .action-btn:hover { background: #16213e; }
    .loading { text-align: center; font-size: 1.2rem; color: #666; padding: 40px; }
  `]
})
export class DashboardComponent implements OnInit {
  private asteroidService = inject(AsteroidService);
  stats: AsteroidStats | null = null;
  hazardAlerts: Asteroid[] = [];
  loading = true;

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.asteroidService.getAsteroidsByDateRange(today, endDate).subscribe({
      next: (asteroids) => {
        this.stats = this.asteroidService.getAsteroidStats(asteroids);
        this.hazardAlerts = asteroids
          .filter(a => a.isPotentiallyHazardousAsteroid)
          .sort((a, b) => b.dangerScore - a.dangerScore)
          .slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching asteroids:', err);
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
