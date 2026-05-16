import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PositionStore } from '../../../stores/positions/positions.store';
import { IBasePosition } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-positions-collection',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './positions-collection.component.html',
  styleUrl: './positions-collection.component.scss'
})
export class PositionsCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBasePosition>();
  
  private positionStore = inject(PositionStore);
  protected loading = this.positionStore.loading;
  
  protected positions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allPositions = this.positionStore.entities();
    
    const filtered = !term
      ? allPositions
      : allPositions.filter(position => 
          position.name?.toLowerCase().includes(term)
        );
    
    return filtered.slice().sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    );
  });
  
  protected onSelect(position: IBasePosition): void {
    if (this.selectable()) {
      this.selection.emit(position);
    }
  }
}
