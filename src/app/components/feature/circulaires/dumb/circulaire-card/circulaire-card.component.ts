import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { IBaseCirculaire } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-circulaire-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <mat-card class="circulaire-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>circle</mat-icon>
        <mat-card-title>{{ circulaire.name }}</mat-card-title>
        <mat-card-subtitle>{{ circulaire.id }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <mat-chip-set>
          <mat-chip [highlighted]="true">
            <mat-icon matChipAvatar>category</mat-icon>
            {{ circulaire.matiere }}
          </mat-chip>
        </mat-chip-set>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .circulaire-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      mat-card-header {
        mat-icon[mat-card-avatar] {
          background: #3f51b5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
      }
      
      mat-card-content {
        padding-top: 16px;
      }
    }
  `]
})
export class CirculaireCardComponent {
  @Input({ required: true }) circulaire!: IBaseCirculaire;
}
