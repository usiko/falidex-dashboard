import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PositionDetail {
  symboleSensName?: string;
  symboleAccessoryName?: string;
  significationName?: string;
  placementName?: string;
  spe?: boolean;
  blame?: boolean;
  absent?: boolean;
}

@Component({
  selector: 'app-symbol-position-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './symbol-position-tooltip.component.html',
  styleUrl: './symbol-position-tooltip.component.scss'
})
export class SymbolPositionTooltipComponent {
  details = input.required<PositionDetail[]>();
}
