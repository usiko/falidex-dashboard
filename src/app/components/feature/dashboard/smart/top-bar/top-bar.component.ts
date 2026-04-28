import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { RelationDataStore } from '../../../../../stores/relations/relations.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { LoginDialogComponent, LoginDialogResult } from '../../../../shared/login-dialog/login-dialog.component';

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
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
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
  private readonly dialog = inject(MatDialog);

  protected readonly isLoggedIn = signal(false);
  protected readonly username = signal<string | null>(null);

  protected readonly relations = this.relationStore.entities;
  protected readonly selectedRelationId = this.selectedRelationStore.selectedRelationId;
  protected readonly selectedRelation = computed(() => {
    const id = this.selectedRelationId();
    if (!id) return null;
    return this.relationStore.entityMap()[id];
  });

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
      this.selectedRelationStore.setSelectedRelationId(relationId,!!relation.editable,!!relation.national);
      this.linkStore.set(relation.relations);
      console.log('Relation sélectionnée:', relationId, '- Liens chargés:', relation.relations.length);
    }
  }
  
  protected onAddRelation(): void {
    this.router.navigate(['/relation/new']);
  }

  protected onLogin(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '400px',
      data: { title: 'Connexion' }
    });

    dialogRef.afterClosed().subscribe((result: LoginDialogResult | null) => {
      if (result) {
        // TODO: Appeler le service d'authentification
        console.log('Login:', result.username);
        this.isLoggedIn.set(true);
        this.username.set(result.username);
      }
    });
  }

  protected onLogout(): void {
    // TODO: Appeler le service de déconnexion
    this.isLoggedIn.set(false);
    this.username.set(null);
    console.log('Déconnecté');
  }
}
