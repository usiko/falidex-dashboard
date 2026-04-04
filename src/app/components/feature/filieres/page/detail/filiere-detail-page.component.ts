import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { FiliereDetailComponent } from '../../smart/filiere-detail/filiere-detail.component';

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
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? undefined)
    )
  );
}
