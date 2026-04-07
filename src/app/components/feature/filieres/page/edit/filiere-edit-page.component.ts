import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { FiliereEditComponent } from '../../smart/filiere-edit/filiere-edit.component';

@Component({
  selector: 'app-filiere-edit-page',
  standalone: true,
  imports: [
    FiliereEditComponent
  ],
  templateUrl: './filiere-edit-page.component.html',
  styleUrl: './filiere-edit-page.component.scss'
})
export class FiliereEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? undefined)
    )
  );
}
