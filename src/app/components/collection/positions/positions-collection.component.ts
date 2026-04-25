import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionStore } from '../../../stores/positions/positions.store';
import { IBasePosition } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-positions-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './positions-collection.component.html',
  styleUrl: './positions-collection.component.scss'
})
export class PositionsCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBasePosition>();
  
  private positionStore = inject(PositionStore);
  protected positions = this.positionStore.entities;
  
  protected onSelect(position: IBasePosition): void {
    if (this.selectable()) {
      this.selection.emit(position);
    }
  }
}
