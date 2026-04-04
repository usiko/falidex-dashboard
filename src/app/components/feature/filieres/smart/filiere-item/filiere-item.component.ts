import { Component, inject, computed, input } from '@angular/core';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { FiliereCardComponent } from '../../dumb/filiere-card/filiere-card.component';
import { FiliereCombination, ColorInfo } from '../../dumb/filiere-combinations-tooltip/filiere-combinations-tooltip.component';

@Component({
  selector: 'app-filiere-item',
  standalone: true,
  imports: [
    FiliereCardComponent
  ],
  templateUrl: './filiere-item.component.html',
  styleUrl: './filiere-item.component.scss'
})
export class FiliereItemComponent {
  filiereId = input.required<string>();

  private readonly filiereStore = inject(FiliereStore);
  private readonly linkStoreInstance = inject(linkStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);

  protected readonly filiere = computed(() => {
    return this.filiereStore.getById(this.filiereId())()
  });

  protected readonly stats = computed(() => {
    return this.linkStoreInstance.getFiliereStats(this.filiereId())();
  });

  protected readonly symboleCount = computed(() => this.stats().symboleCount);
  
  protected readonly inactive = computed(() => {
    return this.stats().symboleCount === 0;
  });
  
  protected readonly symboleNames = computed(() => {
    const links = this.linkStoreInstance.getByFiliereId(this.filiereId())();
    const uniqueIds = [...new Set(links.map(link => link.symboleId).filter(Boolean))];
    return uniqueIds
      .map(id => this.symbolStore.getById(id!)()?.name || '')
      .filter(name => name);
  });
  
  protected readonly firstSymbolImage = computed(() => {
    const links = this.linkStoreInstance.getByFiliereId(this.filiereId())();
    const firstSymbolId = links.find(link => link.symboleId)?.symboleId;
    
    if (!firstSymbolId) return undefined;
    
    const symbol = this.symbolStore.getById(firstSymbolId)();
    return symbol?.imgs && symbol.imgs.length > 0 ? symbol.imgs[0].url : undefined;
  });
  
  protected readonly symboleCombinations = computed(() => {
    const links = this.linkStoreInstance.getByFiliereId(this.filiereId())();
    const combinations: FiliereCombination[] = [];
    
    // Regrouper par symbole et circulaire
    const grouped = new Map<string, Set<string>>();
    
    links.forEach(link => {
      if (!link.symboleId) return;
      
      const key = `${link.symboleId}|${link.circulaireId || ''}`;
      if (!grouped.has(key)) {
        grouped.set(key, new Set());
      }
    });
    
    // Créer les combinaisons
    grouped.forEach((_, key) => {
      const [symboleId, circulaireId] = key.split('|');
      
      const symbolName = this.symbolStore.getById(symboleId)()?.name || '';
      const circulaireName = circulaireId ? this.circulaireStore.getById(circulaireId)()?.name || '' : '';
      
      // Trouver les couleurs pour ce circulaire
      const colors: ColorInfo[] = [];
      if (circulaireId) {
        const circulaireColors = this.circulaireColorStore.getByCirculaireId(circulaireId)();
        
        circulaireColors.forEach(cc => {
          cc.colorIds.forEach(colorId => {
            const color = this.colorStore.getById(colorId)();
            if (color?.name && color?.colorData) {
              colors.push({
                name: color.name,
                colorData: color.colorData
              });
            }
          });
        });
      }
      
      if (symbolName) {
        combinations.push({
          symbolName,
          circulaireName,
          colors: colors.filter((c, index, self) => 
            index === self.findIndex((t) => t.name === c.name)
          )
        });
      }
    });
    
    return combinations;
  });
}
