import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { linkStore } from '../../../../../stores/links/links.store';
import { ItemRelationFormComponent } from '../../../../shared/item-relation-form/item-relation-form.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';

@Component({
  selector: 'app-relation-item-edit',
  standalone: true,
  imports: [CommonModule, ItemRelationFormComponent],
  templateUrl: './relation-item-edit.component.html',
  styleUrl: './relation-item-edit.component.scss'
})
export class RelationItemEditComponent {
  id = input<string | null>();

  private readonly linksStore = inject(linkStore);
  private readonly router = inject(Router);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly currentUserStore = inject(CurrentUserStore);

  protected readonly editable = computed(() =>
    this.selectedRelationStore.isEditable() && !!this.currentUserStore.user()
  );

  protected onValidated(relationData: IRelationItem | null): void {
    if (!relationData) {
      this.router.navigate(['/table']);
      return;
    }
    if (relationData.id) {
      this.linksStore.update(relationData.id, relationData);
    } else {
      const { id, ...dataWithoutId } = relationData;
      this.linksStore.create(dataWithoutId);
    }
    this.router.navigate(['/table']);
  }
}
