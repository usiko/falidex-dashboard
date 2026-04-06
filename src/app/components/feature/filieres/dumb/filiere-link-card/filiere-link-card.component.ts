import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LinkData } from '../../models/link-data.model';
import { ImageCarouselDialogComponent } from '../../../symbols/dialogs/image-carousel-dialog/image-carousel-dialog.component';

@Component({
  selector: 'app-filiere-link-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './filiere-link-card.component.html',
  styleUrl: './filiere-link-card.component.scss'
})
export class FiliereLinkCardComponent {
  linkData = input<LinkData>();
  
  private readonly dialog = inject(MatDialog);
  
  openImageCarousel(images: Array<{ id: string; url: string; }>, index: number, symbolName: string) {
    this.dialog.open(ImageCarouselDialogComponent, {
      data: {
        images,
        initialIndex: index,
        symbolName
      },
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'image-carousel-dialog'
    });
  }
}
