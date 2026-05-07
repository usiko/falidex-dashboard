import { Component } from '@angular/core';
import { SignificationsListComponent } from '../smart/significations-list/significations-list.component';

@Component({
  selector: 'app-significations-list-page',
  standalone: true,
  imports: [SignificationsListComponent],
  templateUrl: './significations-list.page.html',
  styleUrl: './significations-list.page.scss'
})
export class SignificationsListPageComponent {
}
