import { Component } from '@angular/core';
import { PositionsListComponent } from '../smart/positions-list/positions-list.component';

@Component({
  selector: 'app-positions-list-page',
  standalone: true,
  imports: [PositionsListComponent],
  templateUrl: './positions-list.page.html',
  styleUrl: './positions-list.page.scss'
})
export class PositionsListPageComponent {
}
