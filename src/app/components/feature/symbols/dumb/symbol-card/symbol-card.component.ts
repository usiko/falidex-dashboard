import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { OverlayModule } from '@angular/cdk/overlay';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';
import type { RelationTypeStats } from '../../smart/symbol-item/symbol-item.component';
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
    FiliereCombinationsTooltipComponent,
    RouterModule
  ],
  templateUrl: './symbol-card.component.html',
  styleUrl: './symbol-card.component.scss'
})
export class SymbolCardComponent {
  symbol = input.required<IBaseSymbol>();
  relationTypeStats = input<RelationTypeStats[]>([]);
  inactive = input<boolean>(false);
  
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
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

  onCardClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Gérer Ctrl+Click pour ouvrir dans un nouvel onglet
    if (event.ctrlKey || event.metaKey) {
      const path = this.router.createUrlTree(['/symbole', this.symbol().id]).toString();
      const url = `${window.location.origin}${window.location.pathname}#${path}`;
      window.open(url, '_blank');
    } else {
      // Click normal: naviguer
      this.router.navigate(['/symbole', this.symbol().id]);
    }
  }
}
