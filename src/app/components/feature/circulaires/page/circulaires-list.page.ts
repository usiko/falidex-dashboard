import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CirculaireStore } from '../../../../stores/circulaires/circulaires.store';
import { CirculaireCardComponent } from '../dumb/circulaire-card/circulaire-card.component';
import { signal } from '@angular/core';

// Fonction pour normaliser les chaînes en supprimant les accents
function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-circulaires-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    CirculaireCardComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>
          <mat-icon>circle</mat-icon>
          Circulaires
        </h1>
        <p class="subtitle">{{ filteredCirculaires().length }} circulaire(s) disponible(s)</p>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Nom de la circulaire..." />
          <mat-icon matPrefix>search</mat-icon>
          @if (searchTerm()) {
            <button matSuffix mat-icon-button (click)="clearSearch()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
      </div>

      <div class="circulaires-grid">
        @if (filteredCirculaires().length === 0) {
          <div class="empty-state">
            <mat-icon>info</mat-icon>
            <p>Aucune circulaire trouvée</p>
          </div>
        } @else {
          @for (circulaire of filteredCirculaires(); track circulaire.id) {
            <app-circulaire-card [circulaire]="circulaire" />
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
      
      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px 0;
        font-size: 32px;
        font-weight: 500;
        color: #333;
        
        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: #3f51b5;
        }
      }
      
      .subtitle {
        margin: 0;
        color: #666;
        font-size: 16px;
      }
    }

    .filters {
      margin-bottom: 24px;
      
      .search-field {
        width: 400px;
        max-width: 100%;
      }
    }

    .circulaires-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      color: #999;
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
      
      p {
        font-size: 18px;
        margin: 0;
      }
    }
  `]
})
export class CirculairesListPageComponent {
  private readonly circulaireStore = inject(CirculaireStore);

  protected readonly circulaires = this.circulaireStore.entities;
  protected readonly searchTerm = signal('');

  protected readonly filteredCirculaires = computed(() => {
    const search = normalizeString(this.searchTerm().trim());
    if (!search) {
      return this.circulaires();
    }
    return this.circulaires().filter(c => 
      normalizeString(c.name || '').includes(search) ||
      normalizeString(c.matiere || '').includes(search)
    );
  });

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
