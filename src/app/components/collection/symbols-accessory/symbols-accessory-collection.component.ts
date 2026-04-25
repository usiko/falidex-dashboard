import { Component, inject, input, output } from '@angular/core';
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
  selection = output<IBaseSymbolAcessory>();
  
  private symbolAccessoryStore = inject(SymbolAccessoryStore);
  protected symbolsAccessory = this.symbolAccessoryStore.entities;
  
  protected onSelect(symbolAccessory: IBaseSymbolAcessory): void {
    if (this.selectable()) {
      this.selection.emit(symbolAccessory);
    }
  }
}
