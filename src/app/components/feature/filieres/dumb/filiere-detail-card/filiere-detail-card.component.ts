import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { IBaseFiliere } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-filiere-detail-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './filiere-detail-card.component.html',
  styleUrl: './filiere-detail-card.component.scss'
})
export class FiliereDetailCardComponent {
  filiere = input<IBaseFiliere>();
}
