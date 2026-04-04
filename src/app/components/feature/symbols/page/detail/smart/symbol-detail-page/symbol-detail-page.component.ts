import { Component, inject, computed, input } from '@angular/core';
import { SymbolStore } from '../../../../../../../stores/symbols/symbols.store';
import { SymbolDetailComponent } from '../../dumb/symbol-detail/symbol-detail.component';

@Component({
  selector: 'app-symbol-detail-page',
  standalone: true,
  imports: [
    SymbolDetailComponent
  ],
  templateUrl: './symbol-detail-page.component.html',
  styleUrl: './symbol-detail-page.component.scss'
})
export class SymbolDetailPageComponent {
  id = input<string>();
  
  private readonly symbolStore = inject(SymbolStore);
  
  protected readonly symbol = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.symbolStore.getById(id)();
  });
}
