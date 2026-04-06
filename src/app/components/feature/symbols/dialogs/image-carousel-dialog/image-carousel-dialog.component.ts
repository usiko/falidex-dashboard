import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CarouselComponent, CarouselSlide } from '../../../../shared/carousel/carousel.component';


export interface ImageCarouselDialogData {
  images: Array<{ id: string; url: string; }>;
  initialIndex: number;
  symbolName?: string;
}

@Component({
  selector: 'app-image-carousel-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CarouselComponent
  ],
  templateUrl: './image-carousel-dialog.component.html',
  styleUrl: './image-carousel-dialog.component.scss'
})
export class ImageCarouselDialogComponent {
  data = inject<ImageCarouselDialogData>(MAT_DIALOG_DATA);
  
  slides: CarouselSlide[] = this.data.images.map(img => ({
    imageUrl: img.url,
    alt: this.data.symbolName || 'Image'
  }));
}
