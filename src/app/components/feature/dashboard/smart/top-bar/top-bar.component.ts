import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { RelationDataStore } from '../../../../../stores/relations/relations.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent implements OnInit {
  private readonly relationStore = inject(RelationDataStore);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly linkStore = inject(linkStore);
  private readonly router = inject(Router);

  protected readonly relations = this.relationStore.entities;
  protected readonly selectedRelationId = this.selectedRelationStore.selectedRelationId;

  ngOnInit(): void {
    // Sélectionner la première relation par défaut
    const entities = this.relations();
    if (entities.length && !this.selectedRelationId()) {
      this.onRelationChange(entities[0].id);
    }
  }
  protected onRelationChange(relationId: string): void {
    const relation = this.relationStore.entityMap()[relationId];
    if (relation) {
      this.selectedRelationStore.setSelectedRelationId(relationId);
      this.linkStore.set(relation.relations);
      console.log('Relation sélectionnée:', relationId, '- Liens chargés:', relation.relations.length);
    }
  }
}
