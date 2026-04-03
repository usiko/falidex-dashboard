import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { RelationDataStore } from '../../../../../stores/relations/relations.store';

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
export class TopBarComponent {
  private readonly relationStore = inject(RelationDataStore);
  private readonly router = inject(Router);

  protected readonly relations = this.relationStore.entities;
  protected readonly selectedRelationId = signal<string | null>(null);

  constructor() {
    // Sélectionner la première relation par défaut
    const entities = this.relations();
    if (entities.length > 0) {
      this.selectedRelationId.set(entities[0].id);
    }
  }

  protected onRelationChange(relationId: string): void {
    this.selectedRelationId.set(relationId);
    console.log('Relation sélectionnée:', relationId);
  }
}
