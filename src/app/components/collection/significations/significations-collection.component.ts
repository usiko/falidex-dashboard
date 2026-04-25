import { Component, computed, inject, input, output } from '@angular/core';
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
  searchTerm = input<string>('');
  selection = output<IBaseSignification>();
  
  private significationStore = inject(SignificationStore);
  
  protected significations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allSignifications = this.significationStore.entities();
    
    if (!term) {
      return allSignifications;
    }
    
    return allSignifications.filter(sig => 
      sig.content?.toLowerCase().includes(term)
    );
  });
  
  protected onSelect(signification: IBaseSignification): void {
    if (this.selectable()) {
      this.selection.emit(signification);
    }
  }
}
