import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FiliereStore } from '../../../../stores/filieres/filieres.store';
import { FiliereItemComponent } from '../smart/filiere-item/filiere-item.component';

@Component({
  selector: 'app-filieres-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    FiliereItemComponent
  ],
  templateUrl: './filieres-list.page.html',
  styleUrl: './filieres-list.page.scss'
})
export class FilieresListPageComponent {
  private readonly filiereStore = inject(FiliereStore);

  protected readonly filieres = this.filiereStore.entities;
  protected readonly searchTerm = signal('');

  protected readonly filteredFilieres = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) {
      return this.filieres();
    }
    return this.filieres().filter(f => 
      f.name?.toLowerCase().includes(search)
    );
  });

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
