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

export interface PositionStats {
  positionId: string;
  positionName: string;
  count: number;
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

  protected readonly positionStats = computed(() => {
    const links = this.linkStoreInstance.getBySymboleId(this.symboleId())();
    
    // Grouper par position
    const positionMap = new Map<string, typeof links>();
    
    links.forEach(link => {
      if (link.positionId) {
        if (!positionMap.has(link.positionId)) {
          positionMap.set(link.positionId, []);
        }
        positionMap.get(link.positionId)!.push(link);
      }
    });
    
    // Convertir en tableau d'objets avec les noms de position et détails
    const stats: PositionStats[] = [];
    positionMap.forEach((positionLinks, positionId) => {
      const position = this.positionStore.getById(positionId)();
      if (position) {
        // Cas spécial: position-3 (sur circulaire)
        if (positionId === 'position-3') {
          // Séparer les liens avec filière et sans filière
          const linksWithFiliere = positionLinks.filter(link => link.filiereId);
          const linksWithoutFiliere = positionLinks.filter(link => !link.filiereId);
          
          // Si on a des liens avec filière, créer les FiliereCombination
          if (linksWithFiliere.length > 0) {
            const combinations: FiliereCombination[] = [];
            
            // Regrouper par filière et circulaire
            const grouped = new Map<string, Set<string>>();
            
            linksWithFiliere.forEach(link => {
              const key = `${link.filiereId}|${link.circulaireId || ''}`;
              if (!grouped.has(key)) {
                grouped.set(key, new Set());
              }
            });
            
            // Créer les combinaisons
            grouped.forEach((_, key) => {
              const [filiereId, circulaireId] = key.split('|');
              
              const filiereName = filiereId ? this.filiereStore.getById(filiereId)()?.name || '' : '';
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
              
              if (filiereName) {
                combinations.push({
                  symbolName: filiereName,
                  circulaireName,
                  colors: colors.filter((c, index, self) => 
                    index === self.findIndex((t) => t.name === c.name)
                  )
                });
              }
            });
            
            stats.push({
              positionId,
              positionName: position.name || '',
              count: positionLinks.length,
              filiereCombinations: combinations
            });
          }
          
          // Si on a des liens sans filière, créer les PositionDetail
          if (linksWithoutFiliere.length > 0) {
            const details: PositionDetail[] = linksWithoutFiliere.map(link => {
              const detail: PositionDetail = {};
              
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
              
              // Ajouter le placement pour sur circulaire avec signification
              if (link.placementId) {
                const placement = this.placementStore.getById(link.placementId)();
                detail.placementName = placement?.name;
              }
              
              return detail;
            });
            
            // Si on a déjà une stat pour position-3, ajouter les détails
            const existingStat = stats.find(s => s.positionId === positionId);
            if (existingStat) {
              existingStat.details = details;
            } else {
              stats.push({
                positionId,
                positionName: position.name || '',
                count: positionLinks.length,
                details
              });
            }
          }
        } else {
          // Pour les autres positions, utiliser PositionDetail
          const details: PositionDetail[] = positionLinks.map(link => {
            const detail: PositionDetail = {};
            
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
            
            // Ajouter le placement pour sur velours et autres positions
            if (link.placementId) {
              const placement = this.placementStore.getById(link.placementId)();
              detail.placementName = placement?.name;
            }
            
            return detail;
          });
          
          stats.push({
            positionId,
            positionName: position.name || '',
            count: positionLinks.length,
            details
          });
        }
      }
    });
    
    return stats;
  });
  
  protected readonly inactive = computed(() => {
    return this.positionStats().length === 0;
  });
}
