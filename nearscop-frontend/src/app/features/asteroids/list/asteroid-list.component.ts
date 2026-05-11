import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsteroidService } from '../../../core/services/asteroid.service';
import { Asteroid } from '../../../core/models/asteroid.model';

@Component({
  selector: 'app-asteroid-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="list-container">
      <header class="page-header">
        <h1>☄️ Near Earth Asteroids</h1>
        <a routerLink="/" class="back-btn">← Dashboard</a>
      </header>

      <div class="filters">
        <div class="filter-group">
          <label>Start Date:</label>
          <input type="date" [(ngModel)]="startDate" (change)="loadAsteroids()" />
        </div>
        <div class="filter-group">
          <label>End Date:</label>
          <input type="date" [(ngModel)]="endDate" (change)="loadAsteroids()" />
        </div>
        <div class="filter-group">
          <label>Filter:</label>
          <select [(ngModel)]="filterType" (change)="applyFilters()">
            <option value="all">All Asteroids</option>
            <option value="hazardous">Potentially Hazardous</option>
            <option value="safe">Non-Hazardous</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Sort By:</label>
          <select [(ngModel)]="sortBy" (change)="applyFilters()">
            <option value="date">Close Approach Date</option>
            <option value="distance">Miss Distance</option>
            <option value="velocity">Velocity</option>
            <option value="diameter">Diameter</option>
            <option value="danger">Danger Score</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Search:</label>
          <input type="text" placeholder="Search by name..." [(ngModel)]="searchTerm" (input)="applyFilters()" />
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading asteroids...</div>

      <div class="asteroid-grid" *ngIf="!loading">
        <div *ngFor="let asteroid of filteredAsteroids" class="asteroid-card"
             [class.hazardous]="asteroid.isPotentiallyHazardousAsteroid">
          <div class="card-header">
            <a [routerLink]="['/asteroids', asteroid.id]" class="asteroid-name">{{ asteroid.name }}</a>
            <span class="danger-badge" [class]="getDangerClass(asteroid.dangerScore)">
              {{ asteroid.dangerScore }}/100
            </span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">Close Approach:</span>
              <span>{{ asteroid.closeApproachData?.[0]?.closeApproachDate || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Miss Distance:</span>
              <span>{{ asteroid.closeApproachData?.[0]?.missDistance?.kilometers | number:'1.0-0' }} km</span>
            </div>
            <div class="info-row">
              <span class="label">Velocity:</span>
              <span>{{ asteroid.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond | number:'1.1-1' }} km/s</span>
            </div>
            <div class="info-row">
              <span class="label">Diameter:</span>
              <span>{{ asteroid.estimatedDiameter?.kilometers?.max | number:'1.2-2' }} km</span>
            </div>
            <div class="info-row">
              <span class="label">Hazardous:</span>
              <span [class]="asteroid.isPotentiallyHazardousAsteroid ? 'hazard-true' : 'hazard-false'">
                {{ asteroid.isPotentiallyHazardousAsteroid ? 'Yes ⚠️' : 'No' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && filteredAsteroids.length === 0" class="no-results">
        No asteroids found matching your criteria.
      </div>
    </div>
  `,
  styles: [`
    .list-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .page-header h1 { font-size: 2rem; color: #1a1a2e; }
    .back-btn { padding: 10px 20px; background: #1a1a2e; color: white; text-decoration: none; border-radius: 8px; }
    .filters { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .filter-group { display: flex; flex-direction: column; gap: 5px; }
    .filter-group label { font-size: 0.85rem; color: #666; }
    .filter-group input, .filter-group select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; }
    .asteroid-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .asteroid-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
    .asteroid-card:hover { transform: translateY(-5px); }
    .asteroid-card.hazardous { border-left: 4px solid #e74c3c; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .asteroid-name { font-weight: bold; color: #1a1a2e; text-decoration: none; font-size: 1.1rem; }
    .asteroid-name:hover { text-decoration: underline; }
    .danger-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; color: white; }
    .danger-badge.high { background: #e74c3c; }
    .danger-badge.medium { background: #f39c12; }
    .danger-badge.low { background: #27ae60; }
    .card-body { display: flex; flex-direction: column; gap: 10px; }
    .info-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
    .info-row .label { color: #666; }
    .hazard-true { color: #e74c3c; font-weight: bold; }
    .hazard-false { color: #27ae60; }
    .loading, .no-results { text-align: center; padding: 40px; color: #666; font-size: 1.1rem; }
  `]
})
export class AsteroidListComponent implements OnInit {
  private asteroidService = inject(AsteroidService);
  asteroids: Asteroid[] = [];
  filteredAsteroids: Asteroid[] = [];
  loading = true;
  startDate = '';
  endDate = '';
  filterType = 'all';
  sortBy = 'date';
  searchTerm = '';

  ngOnInit() {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.endDate = nextWeek.toISOString().split('T')[0];
    this.loadAsteroids();
  }

  loadAsteroids() {
    this.loading = true;
    this.asteroidService.getAsteroidsByDateRange(this.startDate, this.endDate).subscribe({
      next: (asteroids) => {
        this.asteroids = asteroids;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading asteroids:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.asteroids];

    if (this.filterType === 'hazardous') {
      filtered = filtered.filter(a => a.isPotentiallyHazardousAsteroid);
    } else if (this.filterType === 'safe') {
      filtered = filtered.filter(a => !a.isPotentiallyHazardousAsteroid);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }

    switch (this.sortBy) {
      case 'date':
        filtered.sort((a, b) => (a.closeApproachData?.[0]?.closeApproachDate || '').localeCompare(b.closeApproachData?.[0]?.closeApproachDate || ''));
        break;
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.closeApproachData?.[0]?.missDistance?.kilometers || '999999999') - parseFloat(b.closeApproachData?.[0]?.missDistance?.kilometers || '999999999'));
        break;
      case 'velocity':
        filtered.sort((a, b) => parseFloat(b.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond || '0') - parseFloat(a.closeApproachData?.[0]?.relativeVelocity?.kilometersPerSecond || '0'));
        break;
      case 'diameter':
        filtered.sort((a, b) => (b.estimatedDiameter?.kilometers?.max || 0) - (a.estimatedDiameter?.kilometers?.max || 0));
        break;
      case 'danger':
        filtered.sort((a, b) => b.dangerScore - a.dangerScore);
        break;
    }

    this.filteredAsteroids = filtered;
  }

  getDangerClass(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}
