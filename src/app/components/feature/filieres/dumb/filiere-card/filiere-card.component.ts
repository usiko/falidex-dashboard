import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { IBaseFiliere } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-filiere-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './filiere-card.component.html',
  styleUrl: './filiere-card.component.scss'
})
export class FiliereCardComponent {
  @Input({ required: true }) filiere!: IBaseFiliere;
}
