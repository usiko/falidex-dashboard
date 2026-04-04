import { Component, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { linkStore } from '../../../../../stores/links/links.store';

@Component({
  selector: 'app-symbol-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './symbol-item.component.html',
  styleUrl: './symbol-item.component.scss'
})
export class SymbolItemComponent {
  symboleId = input.required<string>();

  private readonly symbolStore = inject(SymbolStore);
  private readonly linkStoreInstance = inject(linkStore);

  protected readonly symbol = computed(() => {
    return this.symbolStore.getById(this.symboleId())()
  });

  protected readonly stats = computed(() => {
    return this.linkStoreInstance.getSymboleStats(this.symboleId())();
  });

  protected readonly filiereCount = computed(() => this.stats().filiereCount);
  
  protected readonly significationCount = computed(() => this.stats().significationCount);

  protected readonly hasImages = computed(() => {
    const sym = this.symbol();
    return sym?.imgs && sym.imgs.length > 0;
  });

  protected readonly imageCount = computed(() => {
    const sym = this.symbol();
    return sym?.imgs?.length || 0;
  });
}
