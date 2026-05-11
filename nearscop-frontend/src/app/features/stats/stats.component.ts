import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AsteroidService } from '../../core/services/asteroid.service';
import { Asteroid } from '../../core/models/asteroid.model';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="stats-container">
      <header class="page-header">
        <h1>📊 Asteroid Statistics</h1>
        <a routerLink="/" class="back-btn">← Dashboard</a>
      </header>

      <div *ngIf="loading" class="loading">Loading statistics...</div>

      <div *ngIf="!loading" class="stats-content">
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total Tracked</h3>
            <div class="summary-value">{{ asteroids.length }}</div>
          </div>
          <div class="summary-card hazardous">
            <h3>Hazardous</h3>
            <div class="summary-value">{{ hazardousCount }}</div>
          </div>
          <div class="summary-card safe">
            <h3>Non-Hazardous</h3>
            <div class="summary-value">{{ asteroids.length - hazardousCount }}</div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-container">
            <h2>Size Distribution (km)</h2>
            <canvas #sizeChart></canvas>
          </div>
          <div class="chart-container">
            <h2>Velocity Distribution (km/s)</h2>
            <canvas #velocityChart></canvas>
          </div>
          <div class="chart-container">
            <h2>Distance Distribution (km)</h2>
            <canvas #distanceChart></canvas>
          </div>
          <div class="chart-container">
            <h2>Hazardous vs Safe</h2>
            <canvas #hazardChart></canvas>
          </div>
        </div>

        <div class="top-hazardous">
          <h2>Top 10 Most Dangerous Asteroids</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Danger Score</th>
                <th>Distance (km)</th>
                <th>Velocity (km/s)</th>
                <th>Diameter (km)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let asteroid of topHazardous">
                <td><a [routerLink]="['/asteroids', asteroid.id]">{{ asteroid.name }}</a></td>
                <td><span class="danger-badge" [class]="getDangerClass(asteroid.dangerScore)">{{ asteroid.dangerScore }}</span></td>
                <td>{{ asteroid.closeApproachData?.[0]?.missDistance?.kilometers | number:'1.0-0' }}</td>
                <td>{{ asteroid.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond | number:'1.1-1' }}</td>
                <td>{{ asteroid.estimatedDiameter?.kilometers?.max | number:'1.3-3' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .page-header h1 { font-size: 2rem; color: #1a1a2e; }
    .back-btn { padding: 10px 20px; background: #1a1a2e; color: white; text-decoration: none; border-radius: 8px; }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
    .summary-card { background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .summary-card h3 { color: #666; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 10px; }
    .summary-value { font-size: 2.5rem; font-weight: bold; color: #1a1a2e; }
    .summary-card.hazardous .summary-value { color: #e74c3c; }
    .summary-card.safe .summary-value { color: #27ae60; }
    .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 40px; }
    .chart-container { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .chart-container h2 { font-size: 1.2rem; color: #333; margin-bottom: 20px; }
    .top-hazardous { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .top-hazardous h2 { font-size: 1.5rem; color: #333; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: bold; color: #333; }
    td a { color: #1a1a2e; text-decoration: none; }
    td a:hover { text-decoration: underline; }
    .danger-badge { padding: 4px 10px; border-radius: 12px; color: white; font-weight: bold; }
    .danger-badge.high { background: #e74c3c; }
    .danger-badge.medium { background: #f39c12; }
    .danger-badge.low { background: #27ae60; }
    .loading { text-align: center; padding: 40px; color: #666; font-size: 1.1rem; }
  `]
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('sizeChart') sizeChartRef!: ElementRef;
  @ViewChild('velocityChart') velocityChartRef!: ElementRef;
  @ViewChild('distanceChart') distanceChartRef!: ElementRef;
  @ViewChild('hazardChart') hazardChartRef!: ElementRef;

  private asteroidService = inject(AsteroidService);
  asteroids: Asteroid[] = [];
  hazardousCount = 0;
  topHazardous: Asteroid[] = [];
  loading = true;

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.asteroidService.getAsteroidsByDateRange(today, endDate).subscribe({
      next: (asteroids) => {
        this.asteroids = asteroids;
        this.hazardousCount = asteroids.filter(a => a.isPotentiallyHazardousAsteroid).length;
        this.topHazardous = asteroids.sort((a, b) => b.dangerScore - a.dangerScore).slice(0, 10);
        this.loading = false;
        setTimeout(() => this.createCharts(), 0);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
  }

  createCharts() {
    this.createSizeChart();
    this.createVelocityChart();
    this.createDistanceChart();
    this.createHazardChart();
  }

  createSizeChart() {
    const sizes = this.asteroids.map(a => a.estimatedDiameter?.kilometers?.max || 0);
    new Chart(this.sizeChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.asteroids.map((_, i) => i + 1),
        datasets: [{
          label: 'Diameter (km)',
          data: sizes,
          backgroundColor: 'rgba(26, 26, 46, 0.5)',
          borderColor: '#1a1a2e',
          borderWidth: 1
        }]
      },
      options: { responsive: true }
    });
  }

  createVelocityChart() {
    const velocities = this.asteroids.map(a => parseFloat(a.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond || '0'));
    new Chart(this.velocityChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.asteroids.map((_, i) => i + 1),
        datasets: [{
          label: 'Velocity (km/s)',
          data: velocities,
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderColor: '#e74c3c',
          borderWidth: 2,
          fill: true
        }]
      },
      options: { responsive: true }
    });
  }

  createDistanceChart() {
    const distances = this.asteroids.map(a => parseFloat(a.closeApproachData?.[0]?.missDistance?.kilometers || '0'));
    new Chart(this.distanceChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.asteroids.map((_, i) => i + 1),
        datasets: [{
          label: 'Distance (km)',
          data: distances,
          backgroundColor: 'rgba(39, 174, 96, 0.5)',
          borderColor: '#27ae60',
          borderWidth: 1
        }]
      },
      options: { responsive: true }
    });
  }

  createHazardChart() {
    new Chart(this.hazardChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Hazardous', 'Safe'],
        datasets: [{
          data: [this.hazardousCount, this.asteroids.length - this.hazardousCount],
          backgroundColor: ['#e74c3c', '#27ae60']
        }]
      },
      options: { responsive: true }
    });
  }

  getDangerClass(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
