import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IBaseCirculaire, IBaseColor } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-circulaire-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './circulaire-card.component.html',
  styleUrl: './circulaire-card.component.scss'
})
export class CirculaireCardComponent {
  @Input({ required: true }) circulaire!: IBaseCirculaire;
  @Input() colors: IBaseColor[] = [];
  @Input() isEditDisabled: boolean = false;
  
  edit = output<IBaseCirculaire>();
  delete = output<IBaseCirculaire>();
}
