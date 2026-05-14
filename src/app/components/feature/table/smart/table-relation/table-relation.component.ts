import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TruncateTooltipDirective } from '../../../../shared/truncate-tooltip/truncate-tooltip.directive';
import { linkStore } from '../../../../../stores/links/links.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SignificationStore } from '../../../../../stores/significations/significations.store';
import { PlacementStore } from '../../../../../stores/placements/placements.store';
import { PositionStore } from '../../../../../stores/positions/positions.store';
import { CirculaireStore } from '../../../../../stores/circulaires/circulaires.store';
import { SymbolSensStore } from '../../../../../stores/symbols-sens/symbols-sens.store';
import { SymbolAccessoryStore } from '../../../../../stores/symbols-accessory/symbols-accessory.store';

export interface TableRelationRow {
  id: string;
  filiere: string;
  symbole: string;
  signification: string;
  placement: string;
  position: string;
  circulaire: string;
  symboleSens: string;
  symboleAccessory: string;
  spe: boolean;
  absent: boolean;
  note: string;
}

@Component({
  selector: 'app-table-relation',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatIconModule,
    MatPaginatorModule,
    TruncateTooltipDirective,
  ],
  templateUrl: './table-relation.component.html',
  styleUrl: './table-relation.component.scss'
})
export class TableRelationComponent {
  private readonly links = inject(linkStore);
  private readonly filiereStore = inject(FiliereStore);
  private readonly symbolStore = inject(SymbolStore);
  private readonly significationStore = inject(SignificationStore);
  private readonly placementStore = inject(PlacementStore);
  private readonly positionStore = inject(PositionStore);
  private readonly circulaireStore = inject(CirculaireStore);
  private readonly symbolSensStore = inject(SymbolSensStore);
  private readonly symbolAccessoryStore = inject(SymbolAccessoryStore);

  readonly pageSize = signal(25);
  readonly pageIndex = signal(0);
  readonly sort = signal<Sort>({ active: '', direction: '' });

  readonly displayedColumns = [
    'filiere',
    'symbole',
    'signification',
    'placement',
    'position',
    'circulaire',
    'symboleSens',
    'symboleAccessory',
    'spe',
    'absent',
    'note',
  ];

  protected readonly tableRows = computed<TableRelationRow[]>(() => {

    const filiereMap = this.filiereStore.entityMap();
    const symbolMap = this.symbolStore.entityMap();
    const significationMap = this.significationStore.entityMap();
    const placementMap = this.placementStore.entityMap();
    const positionMap = this.positionStore.entityMap();
    const circulaireMap = this.circulaireStore.entityMap();
    const symbolSensMap = this.symbolSensStore.entityMap();
    const symbolAccessoryMap = this.symbolAccessoryStore.entityMap();

    return this.links.entities().map(link => ({
      id: link.id,
      filiere: (link.filiereId ? filiereMap[link.filiereId]?.name : undefined) ?? '',
      symbole: (link.symboleId ? symbolMap[link.symboleId]?.name : undefined) ?? '',
      signification: (link.significationId ? significationMap[link.significationId]?.content : undefined) ?? '',
      placement: (link.placementId ? placementMap[link.placementId]?.name : undefined) ?? '',
      position: (link.positionId ? positionMap[link.positionId]?.name : undefined) ?? '',
      circulaire: (link.circulaireId ? circulaireMap[link.circulaireId]?.name : undefined) ?? '',
      symboleSens: (link.symboleSensId ? symbolSensMap[link.symboleSensId]?.name : undefined) ?? '',
      symboleAccessory: (link.symboleAccessoryId ? symbolAccessoryMap[link.symboleAccessoryId]?.name : undefined) ?? '',
      spe: link.spe ?? false,
      absent: link.absent ?? false,
      note: link.note ?? '',
    }));
  });

  protected readonly sortedRows = computed(() => {
    const { active, direction } = this.sort();
    if (!active || !direction) return this.tableRows();
    const rows = [...this.tableRows()];
    rows.sort((a, b) => {
      const valA = (a as unknown as Record<string, unknown>)[active];
      const valB = (b as unknown as Record<string, unknown>)[active];
      let cmp = 0;
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        cmp = (valA ? 1 : 0) - (valB ? 1 : 0);
      } else {
        cmp = String(valA ?? '').localeCompare(String(valB ?? ''), 'fr', { sensitivity: 'base' });
      }
      return direction === 'asc' ? cmp : -cmp;
    });
    return rows;
  });

  protected readonly totalRows = computed(() => this.tableRows().length);

  protected readonly paginatedRows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize());
  });

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.sort.set(sort);
    this.pageIndex.set(0);
  }
}
