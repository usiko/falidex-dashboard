import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RelationEditFormComponent } from '../../dumb/relation-edit-form/relation-edit-form.component';
import { RelationDataStore } from '../../../../../stores/relations/relations.store';
import { IRelationData } from '../../../../../models/data/base-relations.models';

@Component({
  selector: 'app-relation-new-page',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    RelationEditFormComponent
  ],
  templateUrl: './relation-new-page.component.html',
  styleUrl: './relation-new-page.component.scss'
})
export class RelationNewPageComponent {
  private readonly relationStore = inject(RelationDataStore);
  private readonly router = inject(Router);

  protected readonly relations = this.relationStore.entities;
  protected readonly selectedRelationToCopy = signal<string | null>(null);

  private getDefaultYear(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const referenceDate = new Date(currentYear, 5, 26); // 26 juin de l'année courante (mois 5 = juin en JS)
    
    let yearDiff = currentYear - 1888;
    
    // Si on est avant le 26 juin, on soustrait 1
    if (now < referenceDate) {
      yearDiff -= 1;
    }
    
    return yearDiff;
  }

  protected readonly newRelation = computed<IRelationData>(() => {
    const relationId = this.selectedRelationToCopy();
    
    // Créer une nouvelle relation de base
    const baseRelation: IRelationData = {
      id: `relation-${Date.now()}`,
      name: '',
      annee: this.getDefaultYear(),
      ville: '',
      national: false,
      default: false,
      visible: true,
      editable: true,
      relations: [],
      specificites: []
    };

    // Si une relation est sélectionnée pour copie, copier les relations et specificites
    if (relationId) {
      const relationToCopy = this.relationStore.entityMap()[relationId];
      if (relationToCopy) {
        return {
          ...baseRelation,
          relations: relationToCopy.relations ? [...relationToCopy.relations] : [],
          specificites: relationToCopy.specificites ? [...relationToCopy.specificites] : []
        };
      }
    }

    return baseRelation;
  });

  protected onRelationToCopyChange(relationId: string | null): void {
    this.selectedRelationToCopy.set(relationId);
  }

  protected onValidated(relationData: IRelationData | null): void {
    if (!relationData) {
      // Annulation - retour à la page précédente
      this.router.navigate(['/filieres']);
      return;
    }

    // Ajout de la nouvelle relation
    this.relationStore.add(relationData);
    
    console.log('Nouvelle relation créée:', relationData);
    
    // Retour à la page précédente
    this.router.navigate(['/filieres']);
  }

  protected onDeleted(): void {
    // Pas de suppression en mode création, juste annuler
    this.router.navigate(['/filieres']);
  }
}
