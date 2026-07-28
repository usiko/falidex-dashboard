import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DiffFieldCorrection, DiffOption, DiffRow } from '../../models/diff-row.model';
import { DiffRowComponent } from '../diff-row/diff-row.component';

@Component({
  selector: 'app-diff-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, DiffRowComponent],
  templateUrl: './diff-table.component.html',
  styleUrl: './diff-table.component.scss'
})
export class DiffTableComponent {
  rows = input<DiffRow[]>([]);
  referentialOptions = input<Partial<Record<string, DiffOption[]>>>({});

  fieldCorrected = output<DiffFieldCorrection>();
  incertainResolved = output<string>();
}
