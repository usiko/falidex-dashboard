import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { OverlayModule } from '@angular/cdk/overlay';
import { IBaseFiliere } from '../../../../../models/data/base-data-models';
import type { FiliereCombination } from '../filiere-combinations-tooltip/filiere-combinations-tooltip.component';
import { FiliereCombinationsTooltipComponent } from '../filiere-combinations-tooltip/filiere-combinations-tooltip.component';

@Component({
  selector: 'app-filiere-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    OverlayModule,
    FiliereCombinationsTooltipComponent
  ],
  templateUrl: './filiere-card.component.html',
  styleUrl: './filiere-card.component.scss'
})
export class FiliereCardComponent {
  filiere = input.required<IBaseFiliere>();
  symboleCount = input<number>();
  speCount = input<number>(0);
  inactive = input<boolean>(false);
  symboleNames = input<string[]>([]);
  symboleCombinations = input<FiliereCombination[]>([]);
  symbolImageUrl = input<string | undefined>();
  
  private readonly router = inject(Router);
  protected isTooltipOpen = signal(false);
  
  showTooltip() {
    this.isTooltipOpen.set(true);
  }
  
  hideTooltip() {
    this.isTooltipOpen.set(false);
  }
  
  navigateToDetail() {
    this.router.navigate(['/filiere', this.filiere().id]);
  }
}
