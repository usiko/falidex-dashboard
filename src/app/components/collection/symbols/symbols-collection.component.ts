import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SymbolStore } from '../../../stores/symbols/symbols.store';
import { IBaseSymbol } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-symbols-collection',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './symbols-collection.component.html',
  styleUrl: './symbols-collection.component.scss'
})
export class SymbolsCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBaseSymbol>();
  
  private symbolStore = inject(SymbolStore);
  protected loading = this.symbolStore.loading;
  
  protected symbols = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allSymbols = this.symbolStore.entities();
    
    const filtered = !term
      ? allSymbols
      : allSymbols.filter(symbol => 
          symbol.name?.toLowerCase().includes(term)
        );
    
    return filtered.slice().sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    );
  });
  
  protected onSelect(symbol: IBaseSymbol): void {
    if (this.selectable()) {
      this.selection.emit(symbol);
    }
  }
}
