import { Component, inject, computed, input } from '@angular/core';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SymbolEditFormComponent } from '../../dumb/symbol-edit-form/symbol-edit-form.component';

@Component({
  selector: 'app-symbol-edit',
  standalone: true,
  imports: [
    SymbolEditFormComponent
  ],
  templateUrl: './symbol-edit.component.html',
  styleUrl: './symbol-edit.component.scss'
})
export class SymbolEditComponent {
  id = input<string>();
  
  private readonly symbolStore = inject(SymbolStore);
  
  protected readonly symbol = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.symbolStore.getById(id)();
  });
}
