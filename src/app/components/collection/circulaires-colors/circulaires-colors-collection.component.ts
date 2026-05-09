import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CirculaireColorStore } from '../../../stores/circulaires-colors/circulaires-colors.store';
import { IBaseCirculaireColor } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-circulaires-colors-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circulaires-colors-collection.component.html',
  styleUrl: './circulaires-colors-collection.component.scss'
})
export class CirculairesColorsCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseCirculaireColor>();
  
  private circulaireColorStore = inject(CirculaireColorStore);
  protected circulairesColors = computed(() => 
    this.circulaireColorStore.entities().slice().sort((a, b) => 
      (a.circulaireId || '').toLowerCase().localeCompare((b.circulaireId || '').toLowerCase())
    )
  );
  
  protected onSelect(circulaireColor: IBaseCirculaireColor): void {
    if (this.selectable()) {
      this.selection.emit(circulaireColor);
    }
  }
}
