import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColorInfo {
  name: string;
  colorData: string;
}

export interface FiliereCombination {
  symbolName: string;
  circulaireName: string;
  colors: ColorInfo[];
}

@Component({
  selector: 'app-filiere-combinations-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filiere-combinations-tooltip.component.html',
  styleUrl: './filiere-combinations-tooltip.component.scss'
})
export class FiliereCombinationsTooltipComponent {
  combinations = input.required<FiliereCombination[]>();
}
