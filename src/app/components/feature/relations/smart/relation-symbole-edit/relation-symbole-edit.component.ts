import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { linkStore } from '../../../../../stores/links/links.store';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { SymboleEditFormComponent } from '../../../symbols/dumb/symbole-edit-form/symbole-edit-form.component';
import { IRelationItem } from '../../../../../models/data/base-relations.models';

@Component({
  selector: 'app-relation-symbole-edit',
  standalone: true,
  imports: [
    CommonModule,
    SymboleEditFormComponent
  ],
  templateUrl: './relation-symbole-edit.component.html',
  styleUrl: './relation-symbole-edit.component.scss'
})
export class RelationSymboleEditComponent {
  id = input<string | null>();
  symboleId = input<string | null>();
  
  private readonly linksStore = inject(linkStore);
  private readonly symboleStore = inject(SymbolStore);
  private readonly router = inject(Router);
  
  protected readonly relation = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.linksStore.getById(id)();
  });
  
  protected readonly symbole = computed(() => {
    // Si on a une relation, récupérer le symbole depuis la relation
    const relation = this.relation();
    if (relation?.symboleId) {
      return this.symboleStore.getById(relation.symboleId)();
    }
    
    // Sinon, utiliser le symboleId passé en input (mode création)
    const directSymboleId = this.symboleId();
    if (directSymboleId) {
      return this.symboleStore.getById(directSymboleId)();
    }
    
    return undefined;
  });
  
  protected onValidated(relationData: IRelationItem | null): void {
    if (!relationData) {
      // Annulation : retourner à la page du symbole
      const symboleId = this.symbole()?.id;
      if (symboleId) {
        this.router.navigate(['/symbole', symboleId]);
      } else {
        this.router.navigate(['/symbols']);
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
    
    // Rediriger vers la page de détail du symbole
    const symboleId = this.symbole()?.id;
    if (symboleId) {
      this.router.navigate(['/symbole', symboleId]);
    } else {
      this.router.navigate(['/symbols']);
    }
  }
}
