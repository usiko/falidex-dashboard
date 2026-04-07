import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { SymbolDetailComponent } from '../../smart/symbol-detail/symbol-detail.component';

@Component({
  selector: 'app-symbol-detail-page',
  standalone: true,
  imports: [
    SymbolDetailComponent
  ],
  templateUrl: './symbol-detail-page.component.html',
  styleUrl: './symbol-detail-page.component.scss'
})
export class SymbolDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? undefined)
    )
  );
}
