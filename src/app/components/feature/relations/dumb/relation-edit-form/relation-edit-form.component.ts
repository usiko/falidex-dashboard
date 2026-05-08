import { Component, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { IRelationData } from '../../../../../models/data/base-relations.models';
import { IBaseCodeSpe } from '../../../../../models/data/base-data-models';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { CodeSpeEditDialogComponent, CodeSpeEditDialogData } from '../../../../shared/code-spe-edit-dialog/code-spe-edit-dialog.component';

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
  editable = input<boolean>(true);
  
  // Output pour la validation
  validated = output<IRelationData | null>();
  
  // Output pour la suppression
  deleted = output<void>();
  
  // Inject MatDialog
  private dialog = inject(MatDialog);
  
  // Calcul de l'année par défaut (différence depuis le 26 juin 1888)
  private getDefaultYear(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const referenceDate = new Date(currentYear, 5, 26); // 26 juin de l'année courante (mois 5 = juin en JS)
    
    let yearDiff = currentYear - 1888;
    
    // Si on est avant le 26 juin, on soustrait 1
    if (now < referenceDate) {
      yearDiff -= 1;
    }
    
    return yearDiff;
  }
  
  // Propriétés pour les champs du formulaire
  protected name = '';
  protected annee = this.getDefaultYear();
  protected ville = '';
  protected national = false;
  protected defaultRelation = false;
  protected visible = true;
  protected editableField = true;
  protected specificites = signal<IBaseCodeSpe[]>([]);
  
  constructor() {
    // Initialiser les champs à partir de la relation
    effect(() => {
      const rel = this.relation();
      if (!rel) return;
      
      this.name = rel.name || '';
      this.annee = rel.annee || this.getDefaultYear();
      this.ville = rel.ville || '';
      this.national = rel.national || false;
      this.defaultRelation = rel.default || false;
      this.visible = rel.visible ?? true;
      this.editableField = rel.editable ?? true;
      this.specificites.set(rel.specificites ? [...rel.specificites] : []);
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
      editable: this.editableField,
      specificites: this.specificites()
    };
    
    this.validated.emit(relationData);
  }
  
  protected onNationalChange(value: boolean): void {
    this.national = value;
    if (value) {
      this.name = 'national';
      this.ville = '';
    }
  }
  
  protected onDeleteSpecificite(id: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette spécificité ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.specificites.update(list => list.filter(spe => spe.id !== id));
      }
    });
  }
  
  protected onEditSpecificite(spe: IBaseCodeSpe): void {
    const dialogData: CodeSpeEditDialogData = {
      codeSpe: spe,
      mode: 'edit'
    };
    
    const dialogRef = this.dialog.open(CodeSpeEditDialogComponent, {
      data: dialogData,
      width: '600px'
    });
    
    dialogRef.afterClosed().subscribe((result: IBaseCodeSpe | null) => {
      if (result) {
        // Remplacer la spécificité modifiée en créant un nouveau tableau
        this.specificites.update(list => list.map(s => s.id === spe.id ? result : s));
      }
    });
  }
  
  protected onAddSpecificite(): void {
    const dialogData: CodeSpeEditDialogData = {
      mode: 'add'
    };
    
    const dialogRef = this.dialog.open(CodeSpeEditDialogComponent, {
      data: dialogData,
      width: '600px'
    });
    
    dialogRef.afterClosed().subscribe((result: IBaseCodeSpe | null) => {
      if (result) {
        // Ajouter la nouvelle spécificité
        this.specificites.update(list => [...list, result]);
      }
    });
  }
  
  protected onCancel(): void {
    this.validated.emit(null);
  }
  
  protected onDelete(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmation de suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette relation ? Cette action est irréversible.',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleted.emit();
      }
    });
  }
}
