import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { linkStore } from '../../../../../stores/links/links.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { FiliereEditFormComponent } from '../../../filieres/dumb/filiere-edit-form/filiere-edit-form.component';

@Component({
  selector: 'app-relation-filiere-edit',
  standalone: true,
  imports: [
    CommonModule,
    FiliereEditFormComponent
  ],
  templateUrl: './relation-filiere-edit.component.html',
  styleUrl: './relation-filiere-edit.component.scss'
})
export class RelationFiliereEditComponent {
  id = input<string | null>();
  filiereId = input<string | null>();
  
  private readonly linksStore = inject(linkStore);
  private readonly filiereStore = inject(FiliereStore);
  
  protected readonly relation = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.linksStore.getById(id)();
  });
  
  protected readonly filiere = computed(() => {
    // Si on a une relation, récupérer la filière depuis la relation
    const relation = this.relation();
    if (relation?.filiereId) {
      return this.filiereStore.getById(relation.filiereId)();
    }
    
    // Sinon, utiliser le filiereId passé en input (mode création)
    const directFiliereId = this.filiereId();
    if (directFiliereId) {
      return this.filiereStore.getById(directFiliereId)();
    }
    
    return undefined;
  });
}
