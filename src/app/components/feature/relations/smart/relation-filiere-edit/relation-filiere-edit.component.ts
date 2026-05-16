import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { linkStore } from '../../../../../stores/links/links.store';
import { ItemRelationFormComponent } from '../../../../shared/item-relation-form/item-relation-form.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';

@Component({
  selector: 'app-relation-filiere-edit',
  standalone: true,
  imports: [CommonModule, ItemRelationFormComponent],
  templateUrl: './relation-filiere-edit.component.html',
  styleUrl: './relation-filiere-edit.component.scss'
})
export class RelationFiliereEditComponent {
  id        = input<string | null>();
  filiereId = input<string | null>();

  private readonly linksStore = inject(linkStore);
  private readonly router     = inject(Router);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly currentUserStore      = inject(CurrentUserStore);

  protected readonly editable = computed(() =>
    this.selectedRelationStore.isEditable() && !!this.currentUserStore.user()
  );

  protected readonly contextIds = computed(() => {
    const fid = this.filiereId();
    return fid ? { filiere: fid } : {};
  });

  // filière, position et placement verrouillés dans le contexte filière
  protected readonly lockedCollections = { filiere: true, position: true, placement: true } as const;

  protected onValidated(relationData: IRelationItem | null): void {
    const filiereId = this.filiereId();
    if (!relationData) {
      if (filiereId) this.router.navigate(['/filiere', filiereId]);
      else           this.router.navigate(['/filieres']);
      return;
    }
    if (relationData.id) {
      this.linksStore.update(relationData.id, relationData);
    } else {
      const { id, ...dataWithoutId } = relationData;
      this.linksStore.create(dataWithoutId);
    }
    if (filiereId) this.router.navigate(['/filiere', filiereId]);
    else           this.router.navigate(['/filieres']);
  }
}
