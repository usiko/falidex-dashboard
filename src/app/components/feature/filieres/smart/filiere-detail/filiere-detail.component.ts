import { Component, inject, computed, input } from '@angular/core';
import { FiliereStore } from '../../../../../stores/filieres/filieres.store';
import { FiliereDetailCardComponent } from '../../dumb/filiere-detail-card/filiere-detail-card.component';

@Component({
  selector: 'app-filiere-detail',
  standalone: true,
  imports: [
    FiliereDetailCardComponent
  ],
  templateUrl: './filiere-detail.component.html',
  styleUrl: './filiere-detail.component.scss'
})
export class FiliereDetailComponent {
  id = input<string>();
  
  private readonly filiereStore = inject(FiliereStore);
  
  protected readonly filiere = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.filiereStore.getById(id)();
  });
}
