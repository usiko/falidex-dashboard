import { Component, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { FiliereDetailCardComponent } from '../../dumb/filiere-detail-card/filiere-detail-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';

@Component({
  selector: 'app-filiere-detail',
  standalone: true,
  imports: [
    FiliereDetailCardComponent
  ],
  templateUrl: './filiere-detail.component.html',
  styleUrl: './filiere-detail.component.scss'
})
export class FiliereDetailComponent {
  id = input<string>();
  
  private readonly filiereStore = inject(FiliereStore);
  private readonly linksStore = inject(linkStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  
  protected readonly filiere = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.filiereStore.getById(id)();
  });
  
  protected readonly links = computed(() => {
    const id = this.id();
    if (!id) return [];
    return this.linksStore.getByFiliereId(id)();
  });
  
  protected readonly editable = computed(() => {
    return this.selectedRelationStore.isEditable() && !!this.currentUserStore.user();
  });
  
  onEditLink(linkId: string) {
    this.router.navigate(['/relation', linkId, 'filiere', 'edit']);
  }
  
  onDeleteLink(linkId: string) {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette relation ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        console.log('Suppression confirmée pour linkId:', linkId);
        this.linksStore.remove(linkId)
      }
    });
  }
  
  onAddLink() {
    const filiereId = this.id();
    if (!filiereId) return;    
    // Naviguer vers le formulaire d'édition de la nouvelle relation
    
    this.router.navigate(['/relation','filiere', 'new'], {
      queryParams: { filiereId }
    });
  }
}
