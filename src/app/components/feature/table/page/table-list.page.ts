import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-list-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './table-list.page.html',
  styleUrl: './table-list.page.scss'
})
export class TableListPageComponent {}
