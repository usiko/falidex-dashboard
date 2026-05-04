import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { SymbolStore } from '../../../../stores/symbols/symbols.store';
import { SymbolItemComponent } from '../smart/symbol-item/symbol-item.component';
import { linkStore } from '../../../../stores/links/links.store';
import { FiliereStore } from '../../../../stores/filieres/filieres.store';
import { SignificationStore } from '../../../../stores/significations/significations.store';
import { CirculaireStore } from '../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../stores/colors/colors.store';
import { SymbolSensStore } from '../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../stores/symbols-accessory/symbols-accessory.store';

@Component({
  selector: 'app-symbols-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
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
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);

  protected readonly symbols = this.symbolStore.entities;
  protected readonly searchTerm = signal('');
  protected readonly hideWithoutRelation = signal(false);

  protected readonly filteredSymbols = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const hideNoRelation = this.hideWithoutRelation();
    
    let filtered = this.symbols();
    
    // Filtre masquer sans relation
    if (hideNoRelation) {
      filtered = filtered.filter(symbol => {
        const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
        return links.length > 0;
      });
    }
    
    // Filtre de recherche
    if (!search) {
      return filtered;
    }
    
    return filtered.filter(symbol => {
      // Recherche dans le nom du symbole
      if (symbol.name?.toLowerCase().includes(search)) {
        return true;
      }
      
      // Récupérer les liens de ce symbole
      const links = this.linkStoreInstance.getBySymboleId(symbol.id)();
      
      // Recherche dans les filières
      const filiereIds = [...new Set(links.map(link => link.filiereId).filter(Boolean))];
      const hasMatchingFiliere = filiereIds.some(id => {
        const filiere = this.filiereStore.getById(id!)();
        return filiere?.name?.toLowerCase().includes(search);
      });
      
      if (hasMatchingFiliere) {
        return true;
      }
      
      // Recherche dans les significations
      const significationIds = [...new Set(links.map(link => link.significationId).filter(Boolean))];
      const hasMatchingSignification = significationIds.some(id => {
        const signification = this.significationStore.getById(id!)();
        return signification?.content?.toLowerCase().includes(search);
      });
      
      if (hasMatchingSignification) {
        return true;
      }
      
      // Recherche dans les circulaires (nom et matière) et leurs couleurs
      const circulaireIds = [...new Set(links.map(link => link.circulaireId).filter(Boolean))];
      const hasMatchingCirculaire = circulaireIds.some(id => {
        const circulaire = this.circulaireStore.getById(id!)();
        
        // Recherche dans le nom de la circulaire
        if (circulaire?.name?.toLowerCase().includes(search)) {
          return true;
        }
        
        // Recherche dans la matière (velours/satin)
        if (circulaire?.matiere?.toLowerCase().includes(search)) {
          return true;
        }
        
        // Recherche dans les couleurs de cette circulaire
        if (circulaire) {
          const circulaireColors = this.circulaireColorStore.getByCirculaireId(circulaire.id)();
          const hasMatchingColor = circulaireColors.some(cc => {
            return cc.colorIds.some(colorId => {
              const color = this.colorStore.getById(colorId)();
              return color?.name?.toLowerCase().includes(search);
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
        return symbolSens?.name?.toLowerCase().includes(search);
      });
      
      if (hasMatchingSymbolSens) {
        return true;
      }
      
      // Recherche dans les symboles accessoires
      const symbolAccessoryIds = [...new Set(links.map(link => link.symboleAccessoryId).filter(Boolean))];
      const hasMatchingSymbolAccessory = symbolAccessoryIds.some(id => {
        const symbolAccessory = this.symbolAccessoryStore.getById(id!)();
        return symbolAccessory?.name?.toLowerCase().includes(search);
      });
      
      return hasMatchingSymbolAccessory;
    });
  });

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
