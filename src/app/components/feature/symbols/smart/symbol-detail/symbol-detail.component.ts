import { Component, inject, computed, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SymbolDetailCardComponent } from '../../dumb/symbol-detail-card/symbol-detail-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog.component';

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
  
  onEditLink(linkId: string) {
    console.log('Edit link:', linkId);
    // TODO: Implémenter la logique de modification
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
        // TODO: Implémenter la logique de suppression
      }
    });
  }
  
  onAddLink() {
    console.log('Ajouter une relation pour le symbole:', this.id());
    // TODO: Implémenter la logique d'ajout
  }
}
