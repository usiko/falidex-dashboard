import { Component, inject, computed, input } from '@angular/core';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { FiliereEditFormComponent } from '../../dumb/filiere-edit-form/filiere-edit-form.component';

@Component({
  selector: 'app-filiere-edit',
  standalone: true,
  imports: [
    FiliereEditFormComponent
  ],
  templateUrl: './filiere-edit.component.html',
  styleUrl: './filiere-edit.component.scss'
})
export class FiliereEditComponent {
  id = input<string>();
  
  private readonly filiereStore = inject(FiliereStore);
  
  protected readonly filiere = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.filiereStore.getById(id)();
  });
}
