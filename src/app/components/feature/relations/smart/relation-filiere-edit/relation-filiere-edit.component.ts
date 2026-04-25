import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { linkStore } from '../../../../../stores/links/links.store';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { FiliereEditFormComponent } from '../../../filieres/dumb/filiere-edit-form/filiere-edit-form.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';

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
  private readonly router = inject(Router);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  
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
  
  protected readonly editable = this.selectedRelationStore.isEditable;
  
  protected onValidated(relationData: IRelationItem | null): void {
    if (!relationData) {
      // Annulation : retourner à la page de la filière
      const filiereId = this.filiere()?.id;
      if (filiereId) {
        this.router.navigate(['/filiere', filiereId]);
      } else {
        this.router.navigate(['/filieres']);
      }
      return;
    }
    
    // Validation : sauvegarder ou créer la relation
    if (relationData.id) {
      // Mode édition : mettre à jour
      this.linksStore.update(relationData.id, relationData);
    } else {
      // Mode création : créer une nouvelle relation
      const { id, ...dataWithoutId } = relationData;
      this.linksStore.create(dataWithoutId);
    }
    
    // Rediriger vers la page de détail de la filière
    const filiereId = this.filiere()?.id;
    if (filiereId) {
      this.router.navigate(['/filiere', filiereId]);
    } else {
      this.router.navigate(['/filieres']);
    }
  }
}
