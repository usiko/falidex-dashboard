import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacementStore } from '../../../stores/placements/placements.store';
import { IBasePlacement } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-placements-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './placements-collection.component.html',
  styleUrl: './placements-collection.component.scss'
})
export class PlacementsCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBasePlacement>();
  
  private placementStore = inject(PlacementStore);
  
  protected placements = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allPlacements = this.placementStore.entities();
    
    if (!term) {
      return allPlacements;
    }
    
    return allPlacements.filter(placement => 
      placement.name?.toLowerCase().includes(term)
    );
  });
  
  protected onSelect(placement: IBasePlacement): void {
    if (this.selectable()) {
      this.selection.emit(placement);
    }
  }
}
