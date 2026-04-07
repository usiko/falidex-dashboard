import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBaseFiliere } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-filiere-edit-form',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './filiere-edit-form.component.html',
  styleUrl: './filiere-edit-form.component.scss'
})
export class FiliereEditFormComponent {
  filiere = input<IBaseFiliere>();
}
