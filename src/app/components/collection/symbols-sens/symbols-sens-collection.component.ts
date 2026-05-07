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
    
    if (!term) {
      return allSymbolsSens;
    }
    
    return allSymbolsSens.filter(symbolSens => 
      symbolSens.name?.toLowerCase().includes(term)
    );
  });
  
  protected onSelect(symbolSens: IBaseSymbolSens): void {
    if (this.selectable()) {
      this.selection.emit(symbolSens);
    }
  }
}
