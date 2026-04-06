import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';
import { ImageCarouselDialogComponent } from '../../dialogs/image-carousel-dialog/image-carousel-dialog.component';

@Component({
  selector: 'app-symbol-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './symbol-detail-card.component.html',
  styleUrl: './symbol-detail-card.component.scss'
})
export class SymbolDetailCardComponent {
  symbol = input<IBaseSymbol>();
  
  private readonly dialog = inject(MatDialog);
  
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
