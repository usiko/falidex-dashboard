import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorBadgeComponent } from '../../../../shared/color-badge/color-badge.component';

export interface ColorInfo {
  name: string;
  colorData: string;
}

export interface FiliereCombination {
  symbolName: string;
  circulaireName: string;
  matiere?: string;
  colors: ColorInfo[];
  hasSpe?: boolean;
}

@Component({
  selector: 'app-filiere-combinations-tooltip',
  standalone: true,
  imports: [CommonModule, ColorBadgeComponent],
  templateUrl: './filiere-combinations-tooltip.component.html',
  styleUrl: './filiere-combinations-tooltip.component.scss'
})
export class FiliereCombinationsTooltipComponent {
  combinations = input.required<FiliereCombination[]>();
}
