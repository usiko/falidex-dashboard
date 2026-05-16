import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlacementStore } from '../../../stores/placements/placements.store';
import { CurrentUserStore } from '../../../stores/current-user/current-user.store';
import { IBasePlacement } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-placements-collection',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './placements-collection.component.html',
  styleUrl: './placements-collection.component.scss'
})
export class PlacementsCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBasePlacement>();
  create = output<string>();
  
  private placementStore = inject(PlacementStore);
  private currentUserStore = inject(CurrentUserStore);
  protected loading = this.placementStore.loading;
  
  protected isLoggedIn = computed(() => this.currentUserStore.user() !== null);
  
  protected placements = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allPlacements = this.placementStore.entities();
    
    const filtered = !term
      ? allPlacements
      : allPlacements.filter(placement => 
          placement.name?.toLowerCase().includes(term)
        );
    
    return filtered.slice().sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    );
  });
  
  protected onSelect(placement: IBasePlacement): void {
    if (this.selectable()) {
      this.selection.emit(placement);
    }
  }
  
  protected onCreate(): void {
    const term = this.searchTerm().trim();
    if (term) {
      this.create.emit(term);
    }
  }
}
