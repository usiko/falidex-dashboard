import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RelationSymboleEditComponent } from '../../smart/relation-symbole-edit/relation-symbole-edit.component';

@Component({
  selector: 'app-relation-symbole-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    RelationSymboleEditComponent
  ],
  templateUrl: './relation-symbole-edit-page.component.html',
  styleUrl: './relation-symbole-edit-page.component.scss'
})
export class RelationSymboleEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id'))
    )
  );
  
  protected readonly symboleId = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('symboleId'))
    )
  );
}
