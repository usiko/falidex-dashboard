import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { linkStore } from '../../../../../stores/links/links.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SymboleEditFormComponent } from '../../../symbols/dumb/symbole-edit-form/symbole-edit-form.component';
import { SymbolsCollectionComponent } from '../../../../collection/symbols/symbols-collection.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';

@Component({
  selector: 'app-relation-item-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    SymboleEditFormComponent,
    SymbolsCollectionComponent
  ],
  templateUrl: './relation-item-edit.component.html',
  styleUrl: './relation-item-edit.component.scss'
})
export class RelationItemEditComponent {
  id = input<string | null>();

  private readonly linksStore = inject(linkStore);
  private readonly symboleStore = inject(SymbolStore);
  private readonly router = inject(Router);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly currentUserStore = inject(CurrentUserStore);

  protected readonly searchTerm = signal<string>('');

  protected readonly relation = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.linksStore.getById(id)();
  });

  // En mode édition, le symbole vient de la relation existante.
  // En mode création, il est choisi par l'utilisateur via le picker.
  protected readonly selectedSymbole = signal<IBaseSymbol | null>(null);

  protected readonly symbole = computed(() => {
    const relation = this.relation();
    if (relation?.symboleId) {
      return this.symboleStore.getById(relation.symboleId)();
    }
    return this.selectedSymbole();
  });

  protected readonly editable = computed(() => {
    return this.selectedRelationStore.isEditable() && !!this.currentUserStore.user();
  });

  protected onSymboleSelected(symbole: IBaseSymbol): void {
    this.selectedSymbole.set(symbole);
  }

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
