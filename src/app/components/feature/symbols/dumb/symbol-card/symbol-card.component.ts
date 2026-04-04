import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-symbol-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './symbol-card.component.html',
  styleUrl: './symbol-card.component.scss'
})
export class SymbolCardComponent {
  symbol = input.required<IBaseSymbol>();
  filiereCount = input<number>();
  significationCount = input<number>();
}
