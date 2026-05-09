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
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';
import { InputDialogComponent } from '../../../../shared/input-dialog/input-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { DataService } from '../../../../../services/data/data.service';

@Component({
  selector: 'app-positions-list',
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
  templateUrl: './positions-list.component.html',
  styleUrl: './positions-list.component.scss'
})
export class PositionsListComponent {
  private readonly positionStore = inject(PositionStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  protected readonly positions = this.positionStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);

  // Fonction pour normaliser les chaînes (retirer les accents)
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  protected readonly filteredPositions = computed(() => {
    const term = this.normalizeString(this.searchTerm());
    const allPositions = this.positions().slice().sort((a, b) => 
      this.normalizeString(a.name || '').localeCompare(this.normalizeString(b.name || ''))
    );

    if (!term) {
      return allPositions;
    }

    return allPositions.filter(position =>
      this.normalizeString(position.name || '').includes(term)
    );
  });

  protected onAdd(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: {
        title: 'Nouvelle position',
        placeholder: 'Nom'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.positionStore.create({ name: result });
      }
    });
  }

  protected onEdit(id: string, currentName: string | undefined): void {
    this.dataService.getOccurenceRelationPosition(id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0 
        ? `Cet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)` 
        : undefined;

      const dialogRef = this.dialog.open(InputDialogComponent, {
        width: '400px',
        data: {
          title: 'Modifier position',
          message: message,
          placeholder: 'Nom',
          initialValue: currentName || '',
          confirmText: 'Modifier'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.positionStore.update(id, { name: result });
        }
      });
    });
  }

  protected onDelete(id: string, name: string | undefined): void {
    this.dataService.getOccurenceRelationPosition(id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0
        ? `Impossible de supprimer "${name || ''}" tant qu'il est utilisé.\n\nCet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)`
        : `Êtes-vous sûr de vouloir supprimer "${name || ''}" ?`;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Supprimer la position',
          message: message,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          disabled: totalOccurences > 0
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.positionStore.remove(id);
        }
      });
    });
  }
}
