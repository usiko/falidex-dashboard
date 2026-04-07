import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorStore } from '../../../stores/colors/colors.store';
import { IBaseColor } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-colors-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colors-collection.component.html',
  styleUrl: './colors-collection.component.scss'
})
export class ColorsCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseColor>();
  
  private colorStore = inject(ColorStore);
  protected colors = this.colorStore.entities;
  
  protected onSelect(color: IBaseColor): void {
    if (this.selectable()) {
      this.selection.emit(color);
    }
  }
}
