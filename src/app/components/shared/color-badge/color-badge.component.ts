import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColorBadgeData {
  id: string;
  name: string;
  colorData: string;
}

@Component({
  selector: 'app-color-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-badge.component.html',
  styleUrl: './color-badge.component.scss'
})
export class ColorBadgeComponent {
  color = input.required<ColorBadgeData>();
  matiere = input<string>();
}
