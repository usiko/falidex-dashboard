import { Component, inject, input, output } from '@angular/core';
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
  selection = output<IBaseSymbolSens>();
  
  private symbolSensStore = inject(SymbolSensStore);
  protected symbolsSens = this.symbolSensStore.entities;
  
  protected onSelect(symbolSens: IBaseSymbolSens): void {
    if (this.selectable()) {
      this.selection.emit(symbolSens);
    }
  }
}
