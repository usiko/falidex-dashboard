import { Component, inject, computed, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CiculaireMatiereEnum } from '../../../models/data/circulaire-matiere.enum';
import { ColorStore } from '../../../stores/colors/colors.store';
import { CurrentUserStore } from '../../../stores/current-user/current-user.store';
import { ColorEditDialogComponent } from '../color-edit-dialog/color-edit-dialog.component';

export interface CirculaireEditDialogData {
  title: string;
  name?: string;
  matiere?: string;
  colorIds?: string[];
  confirmText?: string;
  cancelText?: string;
}

export interface CirculaireEditDialogResult {
  name: string;
  matiere: string;
  colorIds: string[];
}

@Component({
  selector: 'app-circulaire-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './circulaire-edit-dialog.component.html',
  styleUrl: './circulaire-edit-dialog.component.scss'
})
export class CirculaireEditDialogComponent {
  data = inject<CirculaireEditDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CirculaireEditDialogComponent>);
  private readonly colorStore = inject(ColorStore);
  private readonly currentUserStore = inject(CurrentUserStore);
  private readonly dialog = inject(MatDialog);

  name: string = '';
  matiere: string = CiculaireMatiereEnum.satin;
  selectedColorIds = signal<string[]>([]);
  colorSearchTerm = signal('');
  
  protected readonly allColors = this.colorStore.entities;
  protected readonly isLoggedIn = computed(() => this.currentUserStore.user() !== null);
  
  // Résout les IDs en objets couleur complets
  protected readonly selectedColors = computed(() => {
    const ids = this.selectedColorIds();
    const colors = this.allColors();
    return ids.map(id => colors.find(c => c.id === id)).filter(c => c !== undefined);
  });
  
  // Filtre les couleurs disponibles selon la recherche
  protected readonly filteredColors = computed(() => {
    const search = this.colorSearchTerm().toLowerCase().trim();
    if (!search) {
      return this.allColors();
    }
    return this.allColors().filter(c => 
      (c.name || '').toLowerCase().includes(search) ||
      (c.colorData || '').toLowerCase().includes(search)
    );
  });

  protected readonly matiereOptions = [
    { value: CiculaireMatiereEnum.satin, label: 'Satin' },
    { value: CiculaireMatiereEnum.velours, label: 'Velours' }
  ];

  constructor() {
    this.name = this.data.name || '';
    this.matiere = this.data.matiere || CiculaireMatiereEnum.satin;
    this.selectedColorIds.set(this.data.colorIds || []);
  }

  get title(): string {
    return this.data.title;
  }

  get confirmText(): string {
    return this.data.confirmText || 'Créer';
  }

  get cancelText(): string {
    return this.data.cancelText || 'Annuler';
  }

  onConfirm(): void {
    if (this.name.trim() && this.matiere) {
      this.dialogRef.close({
        name: this.name.trim(),
        matiere: this.matiere,
        colorIds: this.selectedColorIds()
      } as CirculaireEditDialogResult);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onAddColor(): void {
    const dialogRef = this.dialog.open(ColorEditDialogComponent, {
      width: '500px',
      data: {
        title: 'Nouvelle couleur',
        confirmText: 'Créer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newColorId = this.colorStore.create({
          name: result.name,
          colorData: result.colorData
        });
        // Ajouter la nouvelle couleur à la sélection
        this.selectedColorIds.update(ids => [...ids, newColorId]);
      }
    });
  }

  onSelectExistingColor(colorId: string): void {
    // Ajouter la couleur à la liste (même si déjà présente)
    this.selectedColorIds.update(ids => [...ids, colorId]);
  }

  onRemoveColor(index: number): void {
    this.selectedColorIds.update(ids => {
      const newIds = [...ids];
      newIds.splice(index, 1);
      return newIds;
    });
  }
}
