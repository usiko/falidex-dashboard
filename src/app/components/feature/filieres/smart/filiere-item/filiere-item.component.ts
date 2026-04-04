import { Component, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { linkStore } from '../../../../../stores/links/links.store';

@Component({
  selector: 'app-filiere-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './filiere-item.component.html',
  styleUrl: './filiere-item.component.scss'
})
export class FiliereItemComponent {
  filiereId = input.required<string>();

  private readonly filiereStore = inject(FiliereStore);
  private readonly linkStoreInstance = inject(linkStore);

  protected readonly filiere = computed(() => {
    return this.filiereStore.getById(this.filiereId())()
  });

  protected readonly stats = computed(() => {
    return this.linkStoreInstance.getFiliereStats(this.filiereId())();
  });

  protected readonly symboleCount = computed(() => this.stats().symboleCount);

  protected readonly significationCount = computed(() => this.stats().significationCount);
}
