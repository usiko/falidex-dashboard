import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBaseFiliere } from '../../../../../models/data/base-data-models';
import { IRelationItem } from '../../../../../models/data/base-relations.models';
import { FiliereLinkItemComponent } from '../../smart/filiere-link-item/filiere-link-item.component';

@Component({
  selector: 'app-filiere-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    FiliereLinkItemComponent
  ],
  templateUrl: './filiere-detail-card.component.html',
  styleUrl: './filiere-detail-card.component.scss'
})
export class FiliereDetailCardComponent {
  filiere = input<IBaseFiliere>();
  links = input<IRelationItem[]>([]);
}
