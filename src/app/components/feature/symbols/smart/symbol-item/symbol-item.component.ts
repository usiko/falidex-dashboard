import { Component, inject, computed, input } from '@angular/core';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { SymbolSensStore } from '../../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../../stores/symbols-accessory/symbols-accessory.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { PlacementStore } from '../../../../../stores/placements/placements.store';
import { SymbolCardComponent } from '../../dumb/symbol-card/symbol-card.component';
import type { PositionDetail } from '../../dumb/symbol-position-tooltip/symbol-position-tooltip.component';
import type { FiliereCombination, ColorInfo } from '../../../filieres/dumb/filiere-combinations-tooltip/filiere-combinations-tooltip.component';

export interface RelationTypeStats {
  typeId: string;
  typeName: string;
  count: number;
  speCount: number;
  details?: PositionDetail[];
  filiereCombinations?: FiliereCombination[];
}

@Component({
  selector: 'app-symbol-item',
  standalone: true,
  imports: [
    SymbolCardComponent
  ],
  templateUrl: './symbol-item.component.html',
  styleUrl: './symbol-item.component.scss'
})
export class SymbolItemComponent {
  symboleId = input.required<string>();

  private readonly symbolStore = inject(SymbolStore);
  private readonly linkStoreInstance = inject(linkStore);
  private readonly positionStore = inject(PositionStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  private readonly placementStore = inject(PlacementStore);

  protected readonly symbol = computed(() => {
    return this.symbolStore.getById(this.symboleId())()
  });

  protected readonly relationTypeStats = computed(() => {
    const links = this.linkStoreInstance.getBySymboleId(this.symboleId())();
    
    // Séparer les liens avec filière et avec signification
    const linksWithFiliere = links.filter(link => link.filiereId);
    const linksWithSignification = links.filter(link => link.significationId && !link.filiereId);
    
    const stats: RelationTypeStats[] = [];
    
    // Traiter les liens avec filière
    if (linksWithFiliere.length > 0) {
      const combinations: FiliereCombination[] = [];
      const speCount = linksWithFiliere.filter(link => link.spe === true).length;
      
      // Regrouper par filière et circulaire
      const grouped = new Map<string, typeof linksWithFiliere>();
      
      linksWithFiliere.forEach(link => {
        const key = `${link.filiereId}|${link.circulaireId || ''}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(link);
      });
      
      // Créer les combinaisons
      grouped.forEach((groupLinks, key) => {
        const [filiereId, circulaireId] = key.split('|');
        
        const filiereName = filiereId ? this.filiereStore.getById(filiereId)()?.name || '' : '';
        const circulaire = circulaireId ? this.circulaireStore.getById(circulaireId)() : null;
        const circulaireName = circulaire?.name || '';
        const matiere = circulaire?.matiere;
        
        // Vérifier si au moins un lien a spe=true
        const hasSpe = groupLinks.some(link => link.spe === true);
        const hasBlame = groupLinks.some(link => link.blame === true);
        const hasAbsent = groupLinks.some(link => link.absent === true);
        
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
        
        if (filiereName) {
          combinations.push({
            symbolName: filiereName,
            circulaireName,
            matiere,
            colors: colors.filter((c, index, self) => 
              index === self.findIndex((t) => t.name === c.name)
            ),
            hasSpe,
            hasBlame,
            hasAbsent
          });
        }
      });
      
      stats.push({
        typeId: 'filiere',
        typeName: 'pour filière',
        count: linksWithFiliere.length,
        speCount,
        filiereCombinations: combinations
      });
    }
    
    // Traiter les liens avec signification
    if (linksWithSignification.length > 0) {
      const details: PositionDetail[] = linksWithSignification.map(link => {
        const detail: PositionDetail = {
          spe: link.spe,
          blame: link.blame,
          absent: link.absent
        };
        
        if (link.symboleSensId) {
          const sens = this.symbolSensStore.getById(link.symboleSensId)();
          detail.symboleSensName = sens?.name;
        }
        
        if (link.symboleAccessoryId) {
          const accessory = this.symbolAccessoryStore.getById(link.symboleAccessoryId)();
          detail.symboleAccessoryName = accessory?.name;
        }
        
        if (link.significationId) {
          const signification = this.significationStore.getById(link.significationId)();
          detail.significationName = signification?.content;
        }
        
        if (link.placementId) {
          const placement = this.placementStore.getById(link.placementId)();
          detail.placementName = placement?.name;
        }
        
        return detail;
      });
      
      const speCount = linksWithSignification.filter(link => link.spe === true).length;
      
      stats.push({
        typeId: 'signification',
        typeName: 'pour signification',
        count: linksWithSignification.length,
        speCount,
        details
      });
    }
    
    return stats;
  });
  
  protected readonly inactive = computed(() => {
    return this.relationTypeStats().length === 0;
  });
}
