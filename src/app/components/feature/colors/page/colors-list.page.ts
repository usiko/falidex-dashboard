import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ColorStore } from '../../../../stores/colors/colors.store';
import { CurrentUserStore } from '../../../../stores/current-user/current-user.store';
import { signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ColorEditDialogComponent } from '../../../shared/color-edit-dialog/color-edit-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

// Fonction pour normaliser les chaînes en supprimant les accents
function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-colors-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './colors-list.page.html',
  styleUrl: './colors-list.page.scss'
})
export class ColorsListPageComponent {
  private readonly colorStore = inject(ColorStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);

  protected readonly colors = this.colorStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);

  protected readonly filteredColors = computed(() => {
    const search = normalizeString(this.searchTerm().trim());
    const colors = this.colors().slice().sort((a, b) => 
      normalizeString(a.name || '').localeCompare(normalizeString(b.name || ''))
    );
    if (!search) {
      return colors;
    }
    return colors.filter(c => 
      normalizeString(c.name || '').includes(search) ||
      normalizeString(c.colorData || '').includes(search)
    );
  });

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  protected onAdd(): void {
    const dialogRef = this.dialog.open(ColorEditDialogComponent, {
      width: '500px',
      data: {
        title: 'Nouvelle couleur',
        confirmText: 'Créer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.colorStore.create({
          name: result.name,
          colorData: result.colorData
        });
      }
    });
  }

  protected onEdit(id: string, currentName: string | undefined, currentColor: string | undefined): void {
    const dialogRef = this.dialog.open(ColorEditDialogComponent, {
      width: '500px',
      data: {
        title: 'Modifier la couleur',
        name: currentName,
        colorData: currentColor || '#000000',
        confirmText: 'Modifier'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.colorStore.update(id, {
          name: result.name,
          colorData: result.colorData
        });
      }
    });
  }

  protected onDelete(id: string, name: string | undefined): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer la couleur',
        message: `Êtes-vous sûr de vouloir supprimer "${name || 'cette couleur'}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.colorStore.remove(id);
      }
    });
  }
}

