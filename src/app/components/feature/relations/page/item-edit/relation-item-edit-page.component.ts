import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RelationItemEditComponent } from '../../smart/relation-item-edit/relation-item-edit.component';

@Component({
  selector: 'app-relation-item-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    RelationItemEditComponent
  ],
  templateUrl: './relation-item-edit-page.component.html',
  styleUrl: './relation-item-edit-page.component.scss'
})
export class RelationItemEditPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id'))
    )
  );
}
