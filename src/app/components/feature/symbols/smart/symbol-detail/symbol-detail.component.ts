import { Component, inject, computed, input } from '@angular/core';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SymbolDetailCardComponent } from '../../dumb/symbol-detail-card/symbol-detail-card.component';

@Component({
  selector: 'app-symbol-detail',
  standalone: true,
  imports: [
    SymbolDetailCardComponent
  ],
  templateUrl: './symbol-detail.component.html',
  styleUrl: './symbol-detail.component.scss'
})
export class SymbolDetailComponent {
  id = input<string>();
  
  private readonly symbolStore = inject(SymbolStore);
  
  protected readonly symbol = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.symbolStore.getById(id)();
  });
}
