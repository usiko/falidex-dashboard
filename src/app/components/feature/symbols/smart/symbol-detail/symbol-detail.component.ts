import { Component, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SymbolDetailCardComponent } from '../../dumb/symbol-detail-card/symbol-detail-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { InputDialogComponent, InputDialogData } from '../../../../shared/input-dialog/input-dialog.component';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';

@Component({
  selector: 'app-symbol-detail',
  standalone: true,
  imports: [
    SymbolDetailCardComponent
  ],
  templateUrl: './symbol-detail.component.html',
  styleUrl: './symbol-detail.component.scss'
})
export class SymbolDetailComponent {
  id = input<string>();
  
  private readonly symbolStore = inject(SymbolStore);
  private readonly linksStore = inject(linkStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly selectedRelationStore = inject(SelectedRelationStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  
  protected readonly symbol = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.symbolStore.getById(id)();
  });
  
  protected readonly links = computed(() => {
    const symbolId = this.id();
    if (!symbolId) return [];
    
    // Filtrer les relations qui concernent ce symbole
    return this.linksStore.entities().filter(link => link.symboleId === symbolId);
  });
  
  protected readonly editable = computed(() => {
    return this.selectedRelationStore.isEditable() && !!this.currentUserStore.user();
  });
  
  onEditLink(linkId: string) {
    this.router.navigate(['/relation', linkId, 'symbole', 'edit']);
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
        this.linksStore.remove(linkId);
      }
    });
  }
  
  onAddLink() {
    const symboleId = this.id();
    if (!symboleId) return;
    
    // Naviguer vers le formulaire de création de la nouvelle relation
    this.router.navigate(['/relation', 'symbole', 'new'], {
      queryParams: { symboleId }
    });
  }
  
  onEditSymbol() {
    const symbol = this.symbol();
    if (!symbol) return;
    
    const dialogData: InputDialogData = {
      title: 'Éditer le symbole',
      message: 'Modifier le nom du symbole',
      placeholder: 'Nom du symbole',
      initialValue: symbol.name,
      confirmText: 'Enregistrer',
      cancelText: 'Annuler'
    };
    
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: dialogData,
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && symbol.id) {
        this.symbolStore.update(symbol.id, { name: result });
      }
    });
  }
  
  onDeleteSymbol() {
    const symbol = this.symbol();
    if (!symbol) return;
    
    const dialogData: ConfirmDialogData = {
      title: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer le symbole "${symbol.name}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && symbol.id) {
        // Supprimer le symbole
        this.symbolStore.remove(symbol.id);
        
        // Rediriger vers la liste des symboles
        this.router.navigate(['/symbols']);
      }
    });
  }
}
