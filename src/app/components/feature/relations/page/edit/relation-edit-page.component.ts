import { Component, inject } from '@angular/core';
import { RelationEditComponent } from '../../smart/relation-edit/relation-edit.component';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';

@Component({
  selector: 'app-relation-edit-page',
  standalone: true,
  imports: [
    RelationEditComponent
  ],
  templateUrl: './relation-edit-page.component.html',
  styleUrl: './relation-edit-page.component.scss'
})
export class RelationEditPageComponent {
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  
  protected readonly id = this.selectedRelationStore.selectedRelationId;
}
