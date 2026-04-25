import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IRelationData } from '../../../../../models/data/base-relations.models';
import { IBaseCodeSpe } from '../../../../../models/data/base-data-models';

@Component({
  selector: 'app-relation-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './relation-edit-form.component.html',
  styleUrl: './relation-edit-form.component.scss'
})
export class RelationEditFormComponent {
  relation = input<IRelationData>();
  
  // Output pour la validation
  validated = output<IRelationData | null>();
  
  // Propriétés pour les champs du formulaire
  protected name = '';
  protected annee = new Date().getFullYear();
  protected ville = '';
  protected national = false;
  protected defaultRelation = false;
  protected visible = true;
  protected editable = true;
  protected specificites: IBaseCodeSpe[] = [];
  
  constructor() {
    // Initialiser les champs à partir de la relation
    effect(() => {
      const rel = this.relation();
      if (!rel) return;
      
      this.name = rel.name || '';
      this.annee = rel.annee || new Date().getFullYear();
      this.ville = rel.ville || '';
      this.national = rel.national || false;
      this.defaultRelation = rel.default || false;
      this.visible = rel.visible ?? true;
      this.editable = rel.editable ?? true;
      this.specificites = rel.specificites ? [...rel.specificites] : [];
    });
  }
  
  protected onSubmit(): void {
    const rel = this.relation();
    if (!rel) return;
    
    const relationData: IRelationData = {
      ...rel,
      name: this.name,
      annee: this.annee,
      ville: this.ville,
      national: this.national,
      default: this.defaultRelation,
      visible: this.visible,
      editable: this.editable,
      specificites: this.specificites
    };
    
    this.validated.emit(relationData);
  }
  
  protected onNationalChange(value: boolean): void {
    this.national = value;
    if (value) {
      this.name = 'national';
    }
  }
  
  protected onDeleteSpecificite(id: string): void {
    this.specificites = this.specificites.filter(spe => spe.id !== id);
  }
  
  protected onAddSpecificite(): void {
    // TODO: Ouvrir un dialog pour ajouter une spécificité
    console.log('Ajouter une spécificité');
  }
  
  protected onCancel(): void {
    this.validated.emit(null);
  }
}
