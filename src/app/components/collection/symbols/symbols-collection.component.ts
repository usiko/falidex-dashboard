import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymbolStore } from '../../../stores/symbols/symbols.store';
import { IBaseSymbol } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-symbols-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './symbols-collection.component.html',
  styleUrl: './symbols-collection.component.scss'
})
export class SymbolsCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBaseSymbol>();
  
  private symbolStore = inject(SymbolStore);
  
  protected symbols = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allSymbols = this.symbolStore.entities();
    
    if (!term) {
      return allSymbols;
    }
    
    return allSymbols.filter(symbol => 
      symbol.name?.toLowerCase().includes(term)
    );
  });
  
  protected onSelect(symbol: IBaseSymbol): void {
    if (this.selectable()) {
      this.selection.emit(symbol);
    }
  }
}
