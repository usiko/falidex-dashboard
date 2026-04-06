import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SymbolRelationData } from '../../models/symbol-relation-data.model';
import { ColorBadgeComponent } from '../../../../shared/color-badge/color-badge.component';

@Component({
  selector: 'app-symbol-relation-card',
  standalone: true,
  imports: [
    CommonModule,
    ColorBadgeComponent
  ],
  templateUrl: './symbol-relation-card.component.html',
  styleUrl: './symbol-relation-card.component.scss'
})
export class SymbolRelationCardComponent {
  relationData = input<SymbolRelationData>();
}
