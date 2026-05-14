import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TableRelationComponent } from '../smart/table-relation/table-relation.component';

@Component({
  selector: 'app-table-list-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, TableRelationComponent],
  templateUrl: './table-list.page.html',
  styleUrl: './table-list.page.scss'
})
export class TableListPageComponent {}
