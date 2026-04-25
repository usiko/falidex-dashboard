import { Component, inject, input, output } from '@angular/core';
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
  selection = output<IBaseSymbol>();
  
  private symbolStore = inject(SymbolStore);
  protected symbols = this.symbolStore.entities;
  
  protected onSelect(symbol: IBaseSymbol): void {
    if (this.selectable()) {
      this.selection.emit(symbol);
    }
  }
}
