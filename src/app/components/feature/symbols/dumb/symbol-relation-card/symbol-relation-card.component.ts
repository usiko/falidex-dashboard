import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SymbolRelationData } from '../../models/symbol-relation-data.model';
import { ColorBadgeComponent } from '../../../../shared/color-badge/color-badge.component';

@Component({
  selector: 'app-symbol-relation-card',
  standalone: true,
  imports: [
    CommonModule,
    ColorBadgeComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './symbol-relation-card.component.html',
  styleUrl: './symbol-relation-card.component.scss'
})
export class SymbolRelationCardComponent {
  relationData = input<SymbolRelationData>();
  editable = input<boolean>(true);
  
  edit = output<void>();
  delete = output<void>();
  
  onEdit() {
    this.edit.emit();
  }
  
  onDelete() {
    this.delete.emit();
  }
}
