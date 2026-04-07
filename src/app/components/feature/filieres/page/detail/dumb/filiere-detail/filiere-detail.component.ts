import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { IBaseFiliere } from '../../../../../../../models/data/base-data-models';

@Component({
  selector: 'app-filiere-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './filiere-detail.component.html',
  styleUrl: './filiere-detail.component.scss'
})
export class FiliereDetailComponent {
  filiere = input<IBaseFiliere>();
}
