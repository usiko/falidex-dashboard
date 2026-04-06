import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { OverlayModule } from '@angular/cdk/overlay';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';
import type { PositionStats } from '../../smart/symbol-item/symbol-item.component';
import { SymbolPositionTooltipComponent } from '../symbol-position-tooltip/symbol-position-tooltip.component';
import { FiliereCombinationsTooltipComponent } from '../../../filieres/dumb/filiere-combinations-tooltip/filiere-combinations-tooltip.component';
import { ImageCarouselDialogComponent } from '../../dialogs/image-carousel-dialog/image-carousel-dialog.component';

@Component({
  selector: 'app-symbol-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule,
    OverlayModule,
    SymbolPositionTooltipComponent,
    FiliereCombinationsTooltipComponent
  ],
  templateUrl: './symbol-card.component.html',
  styleUrl: './symbol-card.component.scss'
})
export class SymbolCardComponent {
  symbol = input.required<IBaseSymbol>();
  positionStats = input<PositionStats[]>([]);
  inactive = input<boolean>(false);
  
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  protected openTooltipIndex = signal<number | null>(null);
  
  showTooltip(index: number) {
    this.openTooltipIndex.set(index);
  }
  
  hideTooltip() {
    this.openTooltipIndex.set(null);
  }
  
  isTooltipOpen(index: number): boolean {
    return this.openTooltipIndex() === index;
  }
  
  navigateToDetail() {
    this.router.navigate(['/symbole', this.symbol().id]);
  }
  
  openImageCarousel(event: Event, index: number) {
    event.stopPropagation();
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
