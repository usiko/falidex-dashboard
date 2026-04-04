import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-symbol-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './symbol-detail-card.component.html',
  styleUrl: './symbol-detail-card.component.scss'
})
export class SymbolDetailCardComponent {
  symbol = input<IBaseSymbol>();
}
