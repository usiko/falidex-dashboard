import { Component } from '@angular/core';
import { SymbolsAccessoryListComponent } from '../smart/symbols-accessory-list/symbols-accessory-list.component';

@Component({
  selector: 'app-symbols-accessory-list-page',
  standalone: true,
  imports: [SymbolsAccessoryListComponent],
  templateUrl: './symbols-accessory-list.page.html',
  styleUrl: './symbols-accessory-list.page.scss'
})
export class SymbolsAccessoryListPageComponent {
}
