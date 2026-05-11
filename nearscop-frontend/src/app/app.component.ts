import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-brand">
          <a routerLink="/" class="brand-link">☄️ NearScop</a>
        </div>
        <div class="nav-links">
          <a routerLink="/" class="nav-link">Dashboard</a>
          <a routerLink="/asteroids" class="nav-link">Asteroids</a>
          <a routerLink="/stats" class="nav-link">Statistics</a>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container { min-height: 100vh; background: #f0f2f5; }
    .navbar { background: #1a1a2e; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .brand-link { color: white; text-decoration: none; font-size: 1.5rem; font-weight: bold; }
    .nav-links { display: flex; gap: 20px; }
    .nav-link { color: #ddd; text-decoration: none; font-size: 1rem; padding: 8px 16px; border-radius: 6px; transition: all 0.3s; }
    .nav-link:hover { color: white; background: rgba(255,255,255,0.1); }
    .main-content { padding: 20px; }
  `]
})
export class AppComponent {
  title = 'nearscop-frontend';
}
