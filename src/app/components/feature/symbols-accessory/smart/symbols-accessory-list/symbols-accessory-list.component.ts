import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SymbolAccessoryStore } from '../../../../../stores/symbols-accessory/symbols-accessory.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';
import { InputDialogComponent } from '../../../../shared/input-dialog/input-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-symbols-accessory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './symbols-accessory-list.component.html',
  styleUrl: './symbols-accessory-list.component.scss'
})
export class SymbolsAccessoryListComponent {
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly symbolsAccessory = this.symbolAccessoryStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);

  // Fonction pour normaliser les chaînes (retirer les accents)
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  protected readonly filteredSymbolsAccessory = computed(() => {
    const term = this.normalizeString(this.searchTerm());
    const allSymbolsAccessory = this.symbolsAccessory();

    if (!term) {
      return allSymbolsAccessory;
    }

    return allSymbolsAccessory.filter(symbol =>
      this.normalizeString(symbol.name || '').includes(term)
    );
  });

  protected onAdd(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Nouveau symbole accessoire',
        placeholder: 'Nom'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.symbolAccessoryStore.create({ name: result });
      }
    });
  }

  protected onEdit(id: string, currentName: string | undefined): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier symbole accessoire',
        placeholder: 'Nom',
        initialValue: currentName || '',
        confirmText: 'Modifier'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.symbolAccessoryStore.update(id, { name: result });
      }
    });
  }

  protected onDelete(id: string, name: string | undefined): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer le symbole accessoire',
        message: `Êtes-vous sûr de vouloir supprimer "${name || ''}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.symbolAccessoryStore.remove(id);
      }
    });
  }
}
