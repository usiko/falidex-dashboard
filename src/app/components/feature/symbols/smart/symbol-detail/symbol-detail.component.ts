import { Component, inject, computed, input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SymbolStore } from '../../../../../stores/symbols/symbols.store';
import { linkStore } from '../../../../../stores/links/links.store';
import { SymbolDetailCardComponent } from '../../dumb/symbol-detail-card/symbol-detail-card.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { SelectedRelationStore } from '../../../../../stores/selected-relation/selected-relation.store';
import { CurrentUserStore } from '../../../../../stores/current-user/current-user.store';
import { DataService } from '../../../../../services/data/data.service';

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
  private readonly dataService = inject(DataService);
  
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
  
  protected readonly canEditEntity = computed(() => {
    return !!this.currentUserStore.user();
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
    if (!symbol || !symbol.id) return;
    this.router.navigate(['/symbole', symbol.id, 'edit']);
  }
  
  onDeleteSymbol() {
    const symbol = this.symbol();
    if (!symbol || !symbol.id) return;
    
    this.dataService.getOccurenceRelationSymbole(symbol.id).subscribe(occurences => {
      const totalOccurences = occurences.reduce((sum, occ) => sum + occ.items, 0);
      const totalRelations = occurences.length;
      const message = totalOccurences > 0
        ? `Impossible de supprimer le symbole "${symbol.name}" tant qu'il est utilisé.\n\nCet élément est utilisé : ${totalOccurences} élément(s) parmi ${totalRelations} relation(s)`
        : `Êtes-vous sûr de vouloir supprimer le symbole "${symbol.name}" ?`;

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
        if (confirmed && symbol.id) {
          // Supprimer le symbole
          this.symbolStore.remove(symbol.id);
          
          // Rediriger vers la liste des symboles
          this.router.navigate(['/symbols']);
        }
      });
    });
  }
}
