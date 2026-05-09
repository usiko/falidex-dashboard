import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { ImageCarouselDialogComponent } from '../../dialogs/image-carousel-dialog/image-carousel-dialog.component';
import { SymbolRelationItemComponent } from '../../smart/symbol-relation-item/symbol-relation-item.component';

@Component({
  selector: 'app-symbol-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    SymbolRelationItemComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './symbol-detail-card.component.html',
  styleUrl: './symbol-detail-card.component.scss'
})
export class SymbolDetailCardComponent {
  symbol = input<IBaseSymbol>();
  links = input<IRelationItem[]>([]);
  editable = input<boolean>(true);
  canEditEntity = input<boolean>(true);
  
  addLink = output<void>();
  editLink = output<string>();
  deleteLink = output<string>();
  editSymbol = output<void>();
  deleteSymbol = output<void>();
  
  private readonly dialog = inject(MatDialog);
  
  // Séparer les relations en deux groupes
  protected readonly filiereLinks = computed(() => {
    return this.links().filter(link => link.filiereId);
  });
  
  protected readonly significationLinks = computed(() => {
    return this.links().filter(link => link.significationId && !link.filiereId);
  });
  
  openImageCarousel(index: number) {
    const symbol = this.symbol();
    if (!symbol?.imgs) return;
    
    this.dialog.open(ImageCarouselDialogComponent, {
      data: {
        images: symbol.imgs,
        initialIndex: index,
        symbolName: symbol.name
      },
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'image-carousel-dialog'
    });
  }
}
