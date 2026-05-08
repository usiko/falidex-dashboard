import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FiliereStore } from '../../../../stores/filieres/filieres.store';
import { FiliereItemComponent } from '../smart/filiere-item/filiere-item.component';
import { linkStore } from '../../../../stores/links/links.store';
import { SymbolStore } from '../../../../stores/symbols/symbols.store';
import { CirculaireStore } from '../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../stores/colors/colors.store';
import { CurrentUserStore } from '../../../../stores/current-user/current-user.store';
import { SelectedRelationStore } from '../../../../stores/selected-relation/selected-relation.store';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InputDialogComponent, InputDialogData } from '../../../../components/shared/input-dialog/input-dialog.component';

type SpeFilter = 'all' | 'with-spe' | 'without-spe';
type AbsentFilter = 'all' | 'with-absent' | 'without-absent';

// Fonction pour normaliser les chaînes en supprimant les accents
function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-filieres-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    FormsModule,
    FiliereItemComponent
  ],
  templateUrl: './filieres-list.page.html',
  styleUrl: './filieres-list.page.scss'
})
export class FilieresListPageComponent {
  private readonly filiereStore = inject(FiliereStore);
  private readonly linkStoreInstance = inject(linkStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly dialog = inject(MatDialog);

  protected readonly filieres = this.filiereStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly speFilter = signal<SpeFilter>('all');
  protected readonly absentFilter = signal<AbsentFilter>('all');
  protected readonly hideWithoutRelation = signal(false);
  protected readonly isNational = this.selectedRelationStore.isNational;
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);

  protected readonly filteredFilieres = computed(() => {
    const search = normalizeString(this.searchTerm().trim());
    const speFilterValue = this.speFilter();
    const absentFilterValue = this.absentFilter();
    const hideNoRelation = this.hideWithoutRelation();
    
    let filtered = this.filieres();
    
    // Filtre masquer sans relation
    if (hideNoRelation) {
      filtered = filtered.filter(filiere => {
        const links = this.linkStoreInstance.getByFiliereId(filiere.id)();
        return links.length > 0;
      });
    }
    
    // Filtre SPE
    if (speFilterValue !== 'all') {
      filtered = filtered.filter(filiere => {
        const links = this.linkStoreInstance.getByFiliereId(filiere.id)();
        const hasSpe = links.some(link => link.spe === true);
        return speFilterValue === 'with-spe' ? hasSpe : !hasSpe;
      });
    }
    
    // Filtre Absent
    if (absentFilterValue !== 'all') {
      filtered = filtered.filter(filiere => {
        const links = this.linkStoreInstance.getByFiliereId(filiere.id)();
        const hasAbsent = links.some(link => link.absent === true);
        return absentFilterValue === 'with-absent' ? hasAbsent : !hasAbsent;
      });
    }
    
    // Filtre de recherche
    if (!search) {
      return filtered.slice().sort((a, b) => 
        normalizeString(a.name || '').localeCompare(normalizeString(b.name || ''))
      );
    }
    
    return filtered.filter(filiere => {
      // Recherche dans le nom de la filière
      if (normalizeString(filiere.name || '').includes(search)) {
        return true;
      }
      
      // Récupérer les liens de cette filière
      const links = this.linkStoreInstance.getByFiliereId(filiere.id)();
      
      // Recherche dans les noms de symboles
      const symboleIds = [...new Set(links.map(link => link.symboleId).filter(Boolean))];
      const hasMatchingSymbol = symboleIds.some(id => {
        const symbol = this.symbolStore.getById(id!)();
        return normalizeString(symbol?.name || '').includes(search);
      });
      
      if (hasMatchingSymbol) {
        return true;
      }
      
      // Recherche dans les circulaires (nom et matière) et leurs couleurs
      const circulaireIds = [...new Set(links.map(link => link.circulaireId).filter(Boolean))];
      const hasMatchingCirculaire = circulaireIds.some(id => {
        const circulaire = this.circulaireStore.getById(id!)();
        
        // Recherche dans le nom de la circulaire
        if (normalizeString(circulaire?.name || '').includes(search)) {
          return true;
        }
        
        // Recherche dans la matière (velours/satin)
        if (normalizeString(circulaire?.matiere || '').includes(search)) {
          return true;
        }
        
        // Recherche dans les couleurs de cette circulaire
        if (circulaire) {
          const circulaireColors = this.circulaireColorStore.getByCirculaireId(circulaire.id)();
          const hasMatchingColor = circulaireColors.some(cc => {
            return cc.colorIds.some(colorId => {
              const color = this.colorStore.getById(colorId)();
              return normalizeString(color?.name || '').includes(search);
            });
          });
          
          if (hasMatchingColor) {
            return true;
          }
        }
        
        return false;
      });
      
      return hasMatchingCirculaire;
    }).sort((a, b) => 
      normalizeString(a.name || '').localeCompare(normalizeString(b.name || ''))
    );
  });

  protected onAddFiliere(): void {
    const dialogData: InputDialogData = {
      title: 'Ajouter une filière',
      message: 'Entrez le nom de la nouvelle filière',
      placeholder: 'Nom de la filière',
      confirmText: 'Ajouter',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.filiereStore.create({ name: result });
      }
    });
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
