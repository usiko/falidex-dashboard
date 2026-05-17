import { Component, inject, computed, OnInit } from '@angular/core';
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
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';
import { LoginDialogComponent } from '../../../../shared/login-dialog/login-dialog.component';
import { AuthService } from '../../../../../services/auth/auth.service';

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
  private readonly authService = inject(AuthService);
  private readonly currentUserStore = inject(CurrentUserStore);

  // Utiliser le store pour l'utilisateur courant
  protected readonly currentUser = this.currentUserStore.user;
  protected readonly isLoggedIn = computed(() => !!this.currentUser());

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
      this.selectedRelationStore.setSelectedRelationId(relationId,relation.editable,relation.national);
      this.linkStore.set(relation.relations);
      console.log('Relation sélectionnée:', relationId, '- Liens chargés:', relation.relations.length);
    }
  }
  
  protected onAddRelation(): void {
    this.router.navigate(['/relation/new']);
  }

  private navigateWithCtrlClick(event: MouseEvent, path: string[]): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      const urlPath = this.router.createUrlTree(path).toString();
      const url = `${window.location.origin}${window.location.pathname}#${urlPath}`;
      window.open(url, '_blank');
    } else {
      this.router.navigate(path);
    }
  }

  protected onNavigate(event: MouseEvent, path: string[]): void {
    this.navigateWithCtrlClick(event, path);
  }

  protected onLogin(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '400px',
      data: { title: 'Connexion' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(() => {
      // Le store est automatiquement mis à jour dans le service login
      if (this.currentUser()) {
        console.log('✅ Connexion réussie:', this.currentUser()?.username);
      }
    });
  }

  protected onLogout(): void {
    this.authService.logout().subscribe(() => {
      console.log('✅ Déconnexion réussie');
    });
  }
}
