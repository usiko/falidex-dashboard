import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { RelationFiliereEditComponent } from '../../smart/relation-filiere-edit/relation-filiere-edit.component';

@Component({
  selector: 'app-relation-filiere-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    RelationFiliereEditComponent
  ],
  templateUrl: './relation-filiere-edit-page.component.html',
  styleUrl: './relation-filiere-edit-page.component.scss'
})
export class RelationFiliereEditPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id'))
    )
  );
  
  protected readonly filiereId = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('filiereId'))
    )
  );
}
