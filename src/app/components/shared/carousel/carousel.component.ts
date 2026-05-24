import { Component, CUSTOM_ELEMENTS_SCHEMA, input, effect, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlobImagePipe } from '../../pipe/img-url.pipe';
import { register } from 'swiper/element/bundle';

// Enregistrer les éléments Swiper
register();

/**
 * Composant carousel réutilisable utilisant Swiper
 * 
 * Exemple d'utilisation:
 * ```typescript
 * const slides: CarouselSlide[] = [
 *   { imageUrl: 'path/to/image1.jpg', alt: 'Image 1' },
 *   { imageUrl: 'path/to/image2.jpg', alt: 'Image 2' },
 *   { content: '<p>Contenu HTML personnalisé</p>' }
 * ];
 * ```
 * 
 * ```html
 * <app-carousel 
 *   [slides]="slides"
 *   [navigation]="true"
 *   [pagination]="true"
 *   [loop]="true"
 *   [autoplay]="true"
 *   [autoplayDelay]="3000"
 *   [slidesPerView]="1"
 *   [spaceBetween]="10"
 * />
 * ```
 */
export interface CarouselSlide {
  imageUrl?: string;
  content?: string;
  alt?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, BlobImagePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements AfterViewInit {
  slides = input<CarouselSlide[]>([]);
  navigation = input<boolean>(true);
  pagination = input<boolean>(true);
  loop = input<boolean>(false);
  autoplay = input<boolean>(false);
  autoplayDelay = input<number>(3000);
  slidesPerView = input<number>(1);
  spaceBetween = input<number>(0);
  initialSlide = input<number>(0);

  swiperContainer = viewChild<ElementRef>('swiperContainer');

  ngAfterViewInit() {
    this.initSwiper();
  }

  private initSwiper() {
    const swiperEl = this.swiperContainer()?.nativeElement;
    if (swiperEl) {
      const params = {
        navigation: this.navigation(),
        pagination: this.pagination(),
        loop: this.loop(),
        autoplay: this.autoplay() ? { delay: this.autoplayDelay() } : false,
        slidesPerView: this.slidesPerView(),
        spaceBetween: this.spaceBetween(),
        initialSlide: this.initialSlide()
      };
      
      Object.assign(swiperEl, params);
      swiperEl.initialize();
    }
  }
}
