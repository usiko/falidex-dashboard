import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { SymbolEditComponent } from '../../smart/symbol-edit/symbol-edit.component';

@Component({
  selector: 'app-symbol-edit-page',
  standalone: true,
  imports: [SymbolEditComponent],
  templateUrl: './symbol-edit-page.component.html',
  styleUrl: './symbol-edit-page.component.scss'
})
export class SymbolEditPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? undefined)
    )
  );
}
