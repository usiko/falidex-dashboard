import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRelationItem } from '../../../../../models/data/base-relations.models';

@Component({
  selector: 'app-relation-edit-form',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './relation-edit-form.component.html',
  styleUrl: './relation-edit-form.component.scss'
})
export class RelationEditFormComponent {
  link = input<IRelationItem>();
}
