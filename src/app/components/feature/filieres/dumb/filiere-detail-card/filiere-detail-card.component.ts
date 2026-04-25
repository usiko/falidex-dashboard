import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IBaseFiliere } from '../../../../../models/data/base-data-models';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { FiliereLinkItemComponent } from '../../smart/filiere-link-item/filiere-link-item.component';

@Component({
  selector: 'app-filiere-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    FiliereLinkItemComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './filiere-detail-card.component.html',
  styleUrl: './filiere-detail-card.component.scss'
})
export class FiliereDetailCardComponent {
  filiere = input<IBaseFiliere>();
  links = input<IRelationItem[]>([]);
  editable = input<boolean>(true);
  
  addLink = output<void>();
  editLink = output<string>();
  deleteLink = output<string>();
}
