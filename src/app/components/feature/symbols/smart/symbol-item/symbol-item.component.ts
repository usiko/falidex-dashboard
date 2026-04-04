import { Component, inject, computed, input } from '@angular/core';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SymbolCardComponent } from '../../dumb/symbol-card/symbol-card.component';

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

  protected readonly symbol = computed(() => {
    return this.symbolStore.getById(this.symboleId())()
  });

  protected readonly stats = computed(() => {
    return this.linkStoreInstance.getSymboleStats(this.symboleId())();
  });

  protected readonly filiereCount = computed(() => this.stats().filiereCount);
  
  protected readonly significationCount = computed(() => this.stats().significationCount);
  
  protected readonly inactive = computed(() => {
    const stats = this.stats();
    return stats.filiereCount === 0 && stats.significationCount === 0;
  });
}
