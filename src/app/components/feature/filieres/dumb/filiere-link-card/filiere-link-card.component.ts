import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LinkData } from '../../models/link-data.model';
import { ImageCarouselDialogComponent } from '../../../symbols/dialogs/image-carousel-dialog/image-carousel-dialog.component';
import { ColorBadgeComponent } from '../../../../shared/color-badge/color-badge.component';
import { BlobImagePipe } from '../../../../pipe/img-url.pipe';

@Component({
  selector: 'app-filiere-link-card',
  standalone: true,
  imports: [
    CommonModule,
    ColorBadgeComponent,
    MatButtonModule,
    MatIconModule,
    BlobImagePipe
  ],
  templateUrl: './filiere-link-card.component.html',
  styleUrl: './filiere-link-card.component.scss'
})
export class FiliereLinkCardComponent {
  linkData = input<LinkData>();
  editable = input<boolean>(true);
  
  edit = output<void>();
  delete = output<void>();
  
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
  
  onEdit() {
    this.edit.emit();
  }
  
  onDelete() {
    this.delete.emit();
  }
}
