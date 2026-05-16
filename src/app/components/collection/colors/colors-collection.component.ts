import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ColorStore } from '../../../stores/colors/colors.store';
import { IBaseColor } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-colors-collection',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './colors-collection.component.html',
  styleUrl: './colors-collection.component.scss'
})
export class ColorsCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseColor>();
  
  private colorStore = inject(ColorStore);
  protected loading = this.colorStore.loading;
  protected colors = computed(() => 
    this.colorStore.entities().slice().sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    )
  );
  
  protected onSelect(color: IBaseColor): void {
    if (this.selectable()) {
      this.selection.emit(color);
    }
  }
}
