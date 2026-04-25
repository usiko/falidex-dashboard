import { Component, computed, inject, input, output } from '@angular/core';
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
  searchTerm = input<string>('');
  selection = output<IBaseFiliere>();
  
  private filiereStore = inject(FiliereStore);
  
  protected filieres = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allFilieres = this.filiereStore.entities();
    
    if (!term) {
      return allFilieres;
    }
    
    return allFilieres.filter(fil => 
      fil.name?.toLowerCase().includes(term)
    );
  });
  
  protected onSelect(filiere: IBaseFiliere): void {
    if (this.selectable()) {
      this.selection.emit(filiere);
    }
  }
}
