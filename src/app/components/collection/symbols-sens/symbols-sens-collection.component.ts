import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymbolSensStore } from '../../../stores/symbols-sens/symbols-sens.store';
import { IBaseSymbolSens } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-symbols-sens-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './symbols-sens-collection.component.html',
  styleUrl: './symbols-sens-collection.component.scss'
})
export class SymbolsSensCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBaseSymbolSens>();
  
  private symbolSensStore = inject(SymbolSensStore);
  
  protected symbolsSens = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allSymbolsSens = this.symbolSensStore.entities();
    
    const filtered = !term
      ? allSymbolsSens
      : allSymbolsSens.filter(symbolSens => 
          symbolSens.name?.toLowerCase().includes(term)
        );
    
    return filtered.slice().sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    );
  });
  
  protected onSelect(symbolSens: IBaseSymbolSens): void {
    if (this.selectable()) {
      this.selection.emit(symbolSens);
    }
  }
}
