import { Component, inject, computed, input } from '@angular/core';
import { linkStore } from '../../../../../stores/links/links.store';
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { PlacementStore } from '../../../../../stores/placements/placements.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { SymbolRelationData } from '../../models/symbol-relation-data.model';
import { SymbolRelationCardComponent } from '../../dumb/symbol-relation-card/symbol-relation-card.component';

@Component({
  selector: 'app-symbol-relation-item',
  standalone: true,
  imports: [
    SymbolRelationCardComponent
  ],
  templateUrl: './symbol-relation-item.component.html',
  styleUrl: './symbol-relation-item.component.scss'
})
export class SymbolRelationItemComponent {
  linkId = input<string>();
  hideSymbol = input<boolean>(false);
  
  private readonly linksStore = inject(linkStore);
  private readonly positionStore = inject(PositionStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  private readonly significationStore = inject(SignificationStore);
  
  protected readonly relationData = computed(() => {
    const linkId = this.linkId();
    if (!linkId) return undefined;
    
    const link = this.linksStore.getById(linkId)();
    if (!link) return undefined;
    
    const position = link.positionId ? this.positionStore.getById(link.positionId)() : undefined;
    const placement = link.placementId ? this.placementStore.getById(link.placementId)() : undefined;
    const filiere = link.filiereId ? this.filiereStore.getById(link.filiereId)() : undefined;
    const circulaire = link.circulaireId ? this.circulaireStore.getById(link.circulaireId)() : undefined;
    const signification = link.significationId ? this.significationStore.getById(link.significationId)() : undefined;
    
    // Charger les couleurs de la circulaire
    let circulaireColors: any[] = [];
    if (circulaire) {
      const circulaireColorEntities = this.circulaireColorStore.entities().filter(cc => cc.circulaireId === circulaire.id);
      circulaireColors = circulaireColorEntities.map(cc => {
        const colors = cc.colorIds.map(colorId => this.colorStore.getById(colorId)()).filter(Boolean);
        return {
          circulaireColor: cc,
          colors
        };
      });
    }
    
    return {
      link,
      position,
      placement,
      filiere,
      circulaire,
      signification,
      circulaireColors
    };
  });
}
