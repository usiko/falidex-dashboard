import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymbolAccessoryStore } from '../../../stores/symbols-accessory/symbols-accessory.store';
import { IBaseSymbolAcessory } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-symbols-accessory-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './symbols-accessory-collection.component.html',
  styleUrl: './symbols-accessory-collection.component.scss'
})
export class SymbolsAccessoryCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBaseSymbolAcessory>();
  
  private symbolAccessoryStore = inject(SymbolAccessoryStore);
  
  protected symbolsAccessory = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allSymbolsAccessory = this.symbolAccessoryStore.entities();
    
    if (!term) {
      return allSymbolsAccessory;
    }
    
    return allSymbolsAccessory.filter(symbolAccessory => 
      symbolAccessory.name?.toLowerCase().includes(term)
    );
  });
  
  protected onSelect(symbolAccessory: IBaseSymbolAcessory): void {
    if (this.selectable()) {
      this.selection.emit(symbolAccessory);
    }
  }
}
