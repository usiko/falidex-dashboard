import { Component, inject, input, output } from '@angular/core';
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
  selection = output<IBasePlacement>();
  
  private placementStore = inject(PlacementStore);
  protected placements = this.placementStore.entities;
  
  protected onSelect(placement: IBasePlacement): void {
    if (this.selectable()) {
      this.selection.emit(placement);
    }
  }
}
