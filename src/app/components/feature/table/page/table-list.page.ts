import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableRelationComponent } from '../smart/table-relation/table-relation.component';
import { linkStore } from '../../../../stores/links/links.store';
import { FiliereStore } from '../../../../stores/filieres/filieres.store';
import { SymbolStore } from '../../../../stores/symbols/symbols.store';
import { SignificationStore } from '../../../../stores/significations/significations.store';
import { PlacementStore } from '../../../../stores/placements/placements.store';
import { PositionStore } from '../../../../stores/positions/positions.store';
import { CirculaireStore } from '../../../../stores/circulaires/circulaires.store';
import { SymbolSensStore } from '../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../stores/symbols-accessory/symbols-accessory.store';

@Component({
  selector: 'app-table-list-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, TableRelationComponent],
  templateUrl: './table-list.page.html',
  styleUrl: './table-list.page.scss'
})
export class TableListPageComponent {
  private readonly linkStoreInstance = inject(linkStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly positionStore = inject(PositionStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);

  protected readonly loading = computed(() =>
    this.linkStoreInstance.loading() ||
    this.filiereStore.loading() ||
    this.symbolStore.loading() ||
    this.significationStore.loading() ||
    this.placementStore.loading() ||
    this.positionStore.loading() ||
    this.circulaireStore.loading() ||
    this.symbolSensStore.loading() ||
    this.symbolAccessoryStore.loading()
  );
}
