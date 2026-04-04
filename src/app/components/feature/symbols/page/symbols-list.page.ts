import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { SymbolStore } from '../../../../stores/symbols/symbols.store';
import { SymbolItemComponent } from '../smart/symbol-item/symbol-item.component';

@Component({
  selector: 'app-symbols-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
    SymbolItemComponent
  ],
  templateUrl: './symbols-list.page.html',
  styleUrl: './symbols-list.page.scss'
})
export class SymbolsListPageComponent {
  private readonly symbolStore = inject(SymbolStore);

  protected readonly symbols = this.symbolStore.entities;
  protected readonly searchTerm = signal('');

  protected readonly filteredSymbols = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) {
      return this.symbols();
    }
    return this.symbols().filter(s => 
      s.name?.toLowerCase().includes(search)
    );
  });

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
