import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiliereStore } from '../../../stores/filieres/filieres.store';
import { IBaseFiliere } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-filieres-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filieres-collection.component.html',
  styleUrl: './filieres-collection.component.scss'
})
export class FilieresCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseFiliere>();
  
  private filiereStore = inject(FiliereStore);
  protected filieres = this.filiereStore.entities;
  
  protected onSelect(filiere: IBaseFiliere): void {
    if (this.selectable()) {
      this.selection.emit(filiere);
    }
  }
}
