import { Component } from '@angular/core';
import { PlacementsListComponent } from '../smart/placements-list/placements-list.component';

@Component({
  selector: 'app-placements-list-page',
  standalone: true,
  imports: [PlacementsListComponent],
  templateUrl: './placements-list.page.html',
  styleUrl: './placements-list.page.scss'
})
export class PlacementsListPageComponent {
}
