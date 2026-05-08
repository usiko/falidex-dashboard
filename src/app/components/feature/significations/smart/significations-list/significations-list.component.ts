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
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';
import { InputDialogComponent } from '../../../../shared/input-dialog/input-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-significations-list',
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
  templateUrl: './significations-list.component.html',
  styleUrl: './significations-list.component.scss'
})
export class SignificationsListComponent {
  private readonly significationStore = inject(SignificationStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly significations = this.significationStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);

  // Fonction pour normaliser les chaînes (retirer les accents)
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  protected readonly filteredSignifications = computed(() => {
    const term = this.normalizeString(this.searchTerm());
    const allSignifications = this.significations().slice().sort((a, b) => 
      this.normalizeString(a.content || '').localeCompare(this.normalizeString(b.content || ''))
    );

    if (!term) {
      return allSignifications;
    }

    return allSignifications.filter(sig =>
      this.normalizeString(sig.content || '').includes(term)
    );
  });

  protected onAdd(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '500px',
      data: {
        title: 'Nouvelle signification',
        placeholder: 'Contenu',
        multiline: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.significationStore.create({ content: result });
      }
    });
  }

  protected onEdit(id: string, currentContent: string): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '500px',
      data: {
        title: 'Modifier signification',
        placeholder: 'Contenu',
        initialValue: currentContent,
        multiline: true,
        confirmText: 'Modifier'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.significationStore.update(id, { content: result });
      }
    });
  }

  protected onDelete(id: string, content: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer la signification',
        message: `Êtes-vous sûr de vouloir supprimer "${content}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.significationStore.remove(id);
      }
    });
  }
}
