import { Component, inject, computed, input } from '@angular/core';
import { FiliereStore } from '../../../../../../../stores/filieres/filieres.store';
import { FiliereDetailComponent } from '../../dumb/filiere-detail/filiere-detail.component';

@Component({
  selector: 'app-filiere-detail-page',
  standalone: true,
  imports: [
    FiliereDetailComponent
  ],
  templateUrl: './filiere-detail-page.component.html',
  styleUrl: './filiere-detail-page.component.scss'
})
export class FiliereDetailPageComponent {
  id = input<string>();
  
  private readonly filiereStore = inject(FiliereStore);
  
  protected readonly filiere = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.filiereStore.getById(id)();
  });
}
