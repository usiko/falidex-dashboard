import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBaseSymbol } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-symbol-edit-form',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './symbol-edit-form.component.html',
  styleUrl: './symbol-edit-form.component.scss'
})
export class SymbolEditFormComponent {
  symbol = input<IBaseSymbol>();
}
