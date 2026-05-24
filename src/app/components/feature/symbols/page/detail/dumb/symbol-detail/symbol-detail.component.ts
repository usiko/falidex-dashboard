import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BlobImagePipe } from '../../../../../../pipe/img-url.pipe';
import { IBaseSymbol } from '../../../../../../../models/data/base-data-models';

@Component({
  selector: 'app-symbol-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    BlobImagePipe
  ],
  templateUrl: './symbol-detail.component.html',
  styleUrl: './symbol-detail.component.scss'
})
export class SymbolDetailComponent {
  symbol = input<IBaseSymbol>();
}
