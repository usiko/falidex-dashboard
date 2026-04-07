import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CirculaireStore } from '../../../stores/circulaires/circulaires.store';
import { IBaseCirculaire } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-circulaires-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circulaires-collection.component.html',
  styleUrl: './circulaires-collection.component.scss'
})
export class CirculairesCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseCirculaire>();
  
  private circulaireStore = inject(CirculaireStore);
  protected circulaires = this.circulaireStore.entities;
  
  protected onSelect(circulaire: IBaseCirculaire): void {
    if (this.selectable()) {
      this.selection.emit(circulaire);
    }
  }
}
