import { Component, inject, computed, input, output } from '@angular/core';
import { linkStore } from '../../../../../stores/links/links.store';
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { PlacementStore } from '../../../../../stores/placements/placements.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SymbolSensStore } from '../../../../../stores/symbols-sens/symbols-sens.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { CirculaireColorStore } from '../../../../../stores/circulaires-colors/circulaires-colors.store';
import { ColorStore } from '../../../../../stores/colors/colors.store';
import { LinkData } from '../../models/link-data.model';
import { FiliereLinkCardComponent } from '../../dumb/filiere-link-card/filiere-link-card.component';

@Component({
  selector: 'app-filiere-link-item',
  standalone: true,
  imports: [
    FiliereLinkCardComponent
  ],
  templateUrl: './filiere-link-item.component.html',
  styleUrl: './filiere-link-item.component.scss'
})
export class FiliereLinkItemComponent {
  linkId = input<string>();
  
  editLink = output<string>();
  deleteLink = output<string>();
  
  private readonly linksStore = inject(linkStore);
  private readonly positionStore = inject(PositionStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly circulaireColorStore = inject(CirculaireColorStore);
  private readonly colorStore = inject(ColorStore);
  
  protected readonly linkData = computed(() => {
    const linkId = this.linkId();
    if (!linkId) return undefined;
    
    const link = this.linksStore.getById(linkId)();
    if (!link) return undefined;
    
    const position = link.positionId ? this.positionStore.getById(link.positionId)() : undefined;
    const placement = link.placementId ? this.placementStore.getById(link.placementId)() : undefined;
    const symbole = link.symboleId ? this.symbolStore.getById(link.symboleId)() : undefined;
    const symboleSens = link.symboleSensId ? this.symbolSensStore.getById(link.symboleSensId)() : undefined;
    const circulaire = link.circulaireId ? this.circulaireStore.getById(link.circulaireId)() : undefined;
    
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
      symbole,
      symboleSens,
      circulaire,
      circulaireColors
    };
  });
}
