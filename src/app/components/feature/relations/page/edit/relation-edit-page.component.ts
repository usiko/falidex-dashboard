import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RelationEditComponent } from '../../smart/relation-edit/relation-edit.component';

@Component({
  selector: 'app-relation-edit-page',
  standalone: true,
  imports: [
    RelationEditComponent
  ],
  templateUrl: './relation-edit-page.component.html',
  styleUrl: './relation-edit-page.component.scss'
})
export class RelationEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? undefined)
    )
  );
}
