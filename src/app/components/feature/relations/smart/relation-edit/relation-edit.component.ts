import { Component, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { linkStore } from '../../../../../stores/links/links.store';
import { RelationEditFormComponent } from '../../dumb/relation-edit-form/relation-edit-form.component';
import { RelationDataStore } from '../../../../../stores/relations/relations.store';
import { IRelationData } from '../../../../../models/data/base-relations.models';

@Component({
  selector: 'app-relation-edit',
  standalone: true,
  imports: [
    RelationEditFormComponent
  ],
  templateUrl: './relation-edit.component.html',
  styleUrl: './relation-edit.component.scss'
})
export class RelationEditComponent {
  id = input<string>();
  
  private readonly relationStore = inject(RelationDataStore);
  private readonly router = inject(Router);
  
  protected readonly relation = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.relationStore.getById(id)();
  });

  protected onValidated(relationData: IRelationData | null): void {
    if (!relationData) {
      // Annulation - retour à la page précédente ou accueil
      this.router.navigate(['/filieres']);
      return;
    }

    // Mise à jour de la relation
    this.relationStore.update(relationData.id, relationData);
    
    console.log('Relation mise à jour:', relationData);
  }
  
  protected onDeleted(): void {
    const id = this.id();
    if (!id) return;
    
    // Suppression de la relation
    this.relationStore.remove(id);
    
    console.log('Relation supprimée:', id);
    
    // Retour à la page d'accueil
    this.router.navigate(['/filieres']);
  }
}
