import { Component, inject, computed, input } from '@angular/core';
import { linkStore } from '../../../../../stores/links/links.store';
import { RelationEditFormComponent } from '../../dumb/relation-edit-form/relation-edit-form.component';

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
  
  private readonly linksStore = inject(linkStore);
  
  protected readonly link = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.linksStore.getById(id)();
  });
}
