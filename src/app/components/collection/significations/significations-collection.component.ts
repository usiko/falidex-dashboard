import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignificationStore } from '../../../stores/significations/significations.store';
import { IBaseSignification } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-significations-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './significations-collection.component.html',
  styleUrl: './significations-collection.component.scss'
})
export class SignificationsCollectionComponent {
  selectable = input<boolean>(false);
  selection = output<IBaseSignification>();
  
  private significationStore = inject(SignificationStore);
  protected significations = this.significationStore.entities;
  
  protected onSelect(signification: IBaseSignification): void {
    if (this.selectable()) {
      this.selection.emit(signification);
    }
  }
}
