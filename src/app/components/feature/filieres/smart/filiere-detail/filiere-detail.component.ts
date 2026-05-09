import { Component, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { FiliereDetailCardComponent } from '../../dumb/filiere-detail-card/filiere-detail-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { InputDialogComponent, InputDialogData } from '../../../../shared/input-dialog/input-dialog.component';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';
import { DataService } from '../../../../../services/data/data.service';

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
  private readonly dataService = inject(DataService);
  
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
  
  protected readonly canEditEntity = computed(() => {
    return !!this.currentUserStore.user();
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
  
  onEditFiliere() {
    const filiere = this.filiere();
    if (!filiere || !filiere.id) return;
    
    this.dataService.getOccurenceRelationFiliere(filiere.id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0 
        ? `Cet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)` 
        : undefined;

      const dialogData: InputDialogData = {
        title: 'Éditer la filière',
        message: message,
        placeholder: 'Nom de la filière',
        initialValue: filiere.name,
        confirmText: 'Enregistrer',
        cancelText: 'Annuler'
      };
      
      const dialogRef = this.dialog.open(InputDialogComponent, {
        data: dialogData,
        width: '400px'
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result && filiere.id) {
          this.filiereStore.update(filiere.id, { name: result });
        }
      });
    });
  }
  
  onDeleteFiliere() {
    const filiere = this.filiere();
    if (!filiere || !filiere.id) return;
    
    this.dataService.getOccurenceRelationFiliere(filiere.id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0
        ? `Impossible de supprimer la filière "${filiere.name}" tant qu'elle est utilisée.\n\nCet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)`
        : `Êtes-vous sûr de vouloir supprimer la filière "${filiere.name}" ?`;

      const dialogData: ConfirmDialogData = {
        title: 'Confirmation de suppression',
        message: message,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        disabled: totalOccurences > 0
      };
      
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: dialogData,
        width: '400px'
      });
      
      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed && filiere.id) {
          // Supprimer la filière
          this.filiereStore.remove(filiere.id);
          
          // Rediriger vers la liste des filières
          this.router.navigate(['/filieres']);
        }
      });
    });
  }
}
