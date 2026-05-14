import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SignificationStore } from '../../../stores/significations/significations.store';
import { CurrentUserStore } from '../../../stores/current-user/current-user.store';
import { IBaseSignification } from '../../../models/data/base-data-models';

@Component({
  selector: 'app-significations-collection',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './significations-collection.component.html',
  styleUrl: './significations-collection.component.scss'
})
export class SignificationsCollectionComponent {
  selectable = input<boolean>(false);
  searchTerm = input<string>('');
  selection = output<IBaseSignification>();
  create = output<string>();
  
  private significationStore = inject(SignificationStore);
  private currentUserStore = inject(CurrentUserStore);
  protected loading = this.significationStore.loading;
  
  protected isLoggedIn = computed(() => this.currentUserStore.user() !== null);
  
  protected significations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allSignifications = this.significationStore.entities();
    
    const filtered = !term
      ? allSignifications
      : allSignifications.filter(sig => 
          sig.content?.toLowerCase().includes(term)
        );
    
    return filtered.slice().sort((a, b) => 
      (a.content || '').toLowerCase().localeCompare((b.content || '').toLowerCase())
    );
  });
  
  protected onSelect(signification: IBaseSignification): void {
    if (this.selectable()) {
      this.selection.emit(signification);
    }
  }
  
  protected onCreate(): void {
    const term = this.searchTerm().trim();
    if (term) {
      this.create.emit(term);
    }
  }
}
