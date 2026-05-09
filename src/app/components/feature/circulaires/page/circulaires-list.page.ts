import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CirculaireStore } from '../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../stores/colors/colors.store';
import { CurrentUserStore } from '../../../../stores/current-user/current-user.store';
import { CirculaireCardComponent } from '../dumb/circulaire-card/circulaire-card.component';
import { signal } from '@angular/core';
import { CirculaireEditDialogComponent } from '../../../shared/circulaire-edit-dialog/circulaire-edit-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { IBaseCirculaire, IBaseColor } from '../../../../models/data/base-data-models';
import { DataService } from '../../../../services/data/data.service';

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
    MatButtonModule,
    FormsModule,
    CirculaireCardComponent
  ],
  templateUrl: './circulaires-list.page.html',
  styleUrl: './circulaires-list.page.scss'
})
export class CirculairesListPageComponent {
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);
  private readonly dataService = inject(DataService);

  protected readonly circulaires = this.circulaireStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);

  protected readonly filteredCirculaires = computed(() => {
    const search = normalizeString(this.searchTerm().trim());
    const circulaires = this.circulaires().slice().sort((a, b) => 
      normalizeString(a.name || '').localeCompare(normalizeString(b.name || ''))
    );
    if (!search) {
      return circulaires;
    }
    return circulaires.filter(c => 
      normalizeString(c.name || '').includes(search) ||
      normalizeString(c.matiere || '').includes(search)
    );
  });

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  protected getCirculaireColors(circulaireId: string): IBaseColor[] {
    const circulaireColors = this.circulaireColorStore.entities()
      .filter(cc => cc.circulaireId === circulaireId);
    
    if (circulaireColors.length === 0) {
      return [];
    }
    
    const colorIds = circulaireColors[0].colorIds || [];
    const allColors = this.colorStore.entities();
    
    return colorIds.map(id => allColors.find(c => c.id === id)).filter(c => c !== undefined) as IBaseColor[];
  }

  protected onAdd(): void {
    const dialogRef = this.dialog.open(CirculaireEditDialogComponent, {
      width: '600px',
      data: {
        title: 'Nouvelle circulaire',
        confirmText: 'Créer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const circulaireId = this.circulaireStore.create({
          name: result.name,
          matiere: result.matiere
        });
        
        // Créer l'association circulaire-couleurs si des couleurs sont sélectionnées
        if (result.colorIds && result.colorIds.length > 0) {
          this.circulaireColorStore.create({
            circulaireId: circulaireId,
            colorIds: result.colorIds,
            name: result.name // Optionnel, pour faciliter le débogage
          });
        }
      }
    });
  }

  protected onEdit(circulaire: IBaseCirculaire): void {
    // Récupérer les couleurs associées à cette circulaire
    const circulaireColors = this.circulaireColorStore.entities()
      .filter(cc => cc.circulaireId === circulaire.id);
    const currentColorIds = circulaireColors.length > 0 ? circulaireColors[0].colorIds : [];
    const circulaireColorId = circulaireColors.length > 0 ? circulaireColors[0].id : undefined;
    
    this.dataService.getOccurenceRelationCirculaire(circulaire.id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0 
        ? `Cet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)` 
        : undefined;

      const dialogRef = this.dialog.open(CirculaireEditDialogComponent, {
        width: '600px',
        data: {
          title: 'Modifier la circulaire',
          message: message,
          name: circulaire.name,
          matiere: circulaire.matiere,
          colorIds: currentColorIds,
          confirmText: 'Modifier'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.circulaireStore.update(circulaire.id, {
            name: result.name,
            matiere: result.matiere
          });
          
          // Mettre à jour ou créer l'association circulaire-couleurs
          if (circulaireColorId) {
            // Mise à jour de l'association existante
            this.circulaireColorStore.update(circulaireColorId, {
              colorIds: result.colorIds
            });
          } else if (result.colorIds && result.colorIds.length > 0) {
            // Création d'une nouvelle association
            this.circulaireColorStore.create({
              circulaireId: circulaire.id,
              colorIds: result.colorIds,
              name: result.name
            });
          }
        }
      });
    });
  }

  protected onDelete(circulaire: IBaseCirculaire): void {
    this.dataService.getOccurenceRelationCirculaire(circulaire.id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0
        ? `Impossible de supprimer "${circulaire.name || 'cette circulaire'}" tant qu'elle est utilisée.\n\nCet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)`
        : `Êtes-vous sûr de vouloir supprimer "${circulaire.name || 'cette circulaire'}" ?`;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Supprimer la circulaire',
          message: message,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          disabled: totalOccurences > 0
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.circulaireStore.remove(circulaire.id);
          
          // Supprimer aussi l'association circulaire-couleurs
          const circulaireColors = this.circulaireColorStore.entities()
            .filter(cc => cc.circulaireId === circulaire.id);
          circulaireColors.forEach(cc => this.circulaireColorStore.remove(cc.id));
        }
      });
    });
  }
}

