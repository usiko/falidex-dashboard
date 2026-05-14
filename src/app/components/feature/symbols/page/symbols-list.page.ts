import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SymbolStore } from '../../../../stores/symbols/symbols.store';
import { SymbolItemComponent } from '../smart/symbol-item/symbol-item.component';
import { linkStore } from '../../../../stores/links/links.store';
import { FiliereStore } from '../../../../stores/filieres/filieres.store';
import { SignificationStore } from '../../../../stores/significations/significations.store';
import { CirculaireStore } from '../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../stores/colors/colors.store';
import { CurrentUserStore } from '../../../../stores/current-user/current-user.store';
import { SymbolSensStore } from '../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../stores/symbols-accessory/symbols-accessory.store';
import { CiculaireMatiereEnum } from '../../../../models/data/circulaire-matiere.enum';
import { InputDialogComponent, InputDialogData } from '../../../../components/shared/input-dialog/input-dialog.component';

type BlameFilter = 'all' | 'with-blame' | 'without-blame';
type RelationFilter = 'all' | 'only-filiere' | 'only-signification';
type SupportFilter = 'all' | 'circulaire' | 'velours';
type SpeFilter = 'all' | 'with-spe' | 'without-spe';

// Fonction pour normaliser les chaînes en supprimant les accents
function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-symbols-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    FormsModule,
    SymbolItemComponent
  ],
  templateUrl: './symbols-list.page.html',
  styleUrl: './symbols-list.page.scss'
})
export class SymbolsListPageComponent {
  private readonly symbolStore = inject(SymbolStore);
  private readonly linkStoreInstance = inject(linkStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);
  private readonly dialog = inject(MatDialog);

  protected readonly symbols = this.symbolStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly blameFilter = signal<BlameFilter>('all');
  protected readonly hideWithoutRelation = signal(false);
  protected readonly relationFilter = signal<RelationFilter>('all');
  protected readonly supportFilter = signal<SupportFilter>('all');
  protected readonly speFilter = signal<SpeFilter>('all');
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);
  protected readonly loading = computed(() =>
    this.symbolStore.loading() ||
    this.linkStoreInstance.loading() ||
    this.filiereStore.loading() ||
    this.significationStore.loading() ||
    this.circulaireStore.loading() ||
    this.circulaireColorStore.loading() ||
    this.colorStore.loading() ||
    this.symbolSensStore.loading() ||
    this.symbolAccessoryStore.loading()
  );

  protected readonly filteredSymbols = computed(() => {
    const search = normalizeString(this.searchTerm().trim());
    const blameFilterValue = this.blameFilter();
    const hideNoRelation = this.hideWithoutRelation();
    const relationFilterValue = this.relationFilter();
    const supportFilterValue = this.supportFilter();
    const speFilterValue = this.speFilter();
    
    let filtered = this.symbols();
    
    // Filtre masquer sans relation
    if (hideNoRelation) {
      filtered = filtered.filter(symbol => {
        const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
        return links.length > 0;
      });
    }
    
    // Filtre Blame
    if (blameFilterValue !== 'all') {
      filtered = filtered.filter(symbol => {
        const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
        const hasBlame = links.some(link => link.blame === true);
        return blameFilterValue === 'with-blame' ? hasBlame : !hasBlame;
      });
    }
    
    // Filtre Relation (Filière ou Signification)
    if (relationFilterValue !== 'all') {
      filtered = filtered.filter(symbol => {
        const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
        if (relationFilterValue === 'only-filiere') {
          return links.some(link => link.filiereId && !link.significationId);
        } else {
          return links.some(link => link.significationId && !link.filiereId);
        }
      });
    }
    
    // Filtre Support (Position: Circulaire/Velours)
    if (supportFilterValue !== 'all') {
      filtered = filtered.filter(symbol => {
        const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
        
        return links.some(link => {
          if (supportFilterValue === 'circulaire') {
            return link.positionId === 'position-3'; // sur circulaire
          } else {
            return link.positionId === 'position-4'; // sur velours
          }
        });
      });
    }
    
    // Filtre SPE
    if (speFilterValue !== 'all') {
      filtered = filtered.filter(symbol => {
        const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
        const hasSpe = links.some(link => link.spe === true);
        return speFilterValue === 'with-spe' ? hasSpe : !hasSpe;
      });
    }
    
    // Filtre de recherche
    if (!search) {
      return filtered.slice().sort((a, b) => 
        normalizeString(a.name || '').localeCompare(normalizeString(b.name || ''))
      );
    }
    
    return filtered.filter(symbol => {
      // Recherche dans le nom du symbole
      if (normalizeString(symbol.name || '').includes(search)) {
        return true;
      }
      
      // Récupérer les liens de ce symbole
      const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
      
      // Recherche dans les filières
      const filiereIds = [...new Set(links.map(link => link.filiereId).filter(Boolean))];
      const hasMatchingFiliere = filiereIds.some(id => {
        const filiere = this.filiereStore.getById(id!)();
        return normalizeString(filiere?.name || '').includes(search);
      });
      
      if (hasMatchingFiliere) {
        return true;
      }
      
      // Recherche dans les significations
      const significationIds = [...new Set(links.map(link => link.significationId).filter(Boolean))];
      const hasMatchingSignification = significationIds.some(id => {
        const signification = this.significationStore.getById(id!)();
        return normalizeString(signification?.content || '').includes(search);
      });
      
      if (hasMatchingSignification) {
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
      
      if (hasMatchingCirculaire) {
        return true;
      }
      
      // Recherche dans les symboles sens
      const symbolSensIds = [...new Set(links.map(link => link.symboleSensId).filter(Boolean))];
      const hasMatchingSymbolSens = symbolSensIds.some(id => {
        const symbolSens = this.symbolSensStore.getById(id!)();
        return normalizeString(symbolSens?.name || '').includes(search);
      });
      
      if (hasMatchingSymbolSens) {
        return true;
      }
      
      // Recherche dans les symboles accessoires
      const symbolAccessoryIds = [...new Set(links.map(link => link.symboleAccessoryId).filter(Boolean))];
      const hasMatchingSymbolAccessory = symbolAccessoryIds.some(id => {
        const symbolAccessory = this.symbolAccessoryStore.getById(id!)();
        return normalizeString(symbolAccessory?.name || '').includes(search);
      });
      
      return hasMatchingSymbolAccessory;
    }).sort((a, b) => 
      normalizeString(a.name || '').localeCompare(normalizeString(b.name || ''))
    );
  });

  protected onAddSymbol(): void {
    const dialogData: InputDialogData = {
      title: 'Ajouter un symbole',
      message: 'Entrez le nom du nouveau symbole',
      placeholder: 'Nom du symbole',
      confirmText: 'Ajouter',
      cancelText: 'Annuler'
    };

    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: dialogData,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.symbolStore.create({ name: result });
      }
    });
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
