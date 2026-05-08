import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface ColorEditDialogData {
  title: string;
  name?: string;
  colorData?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ColorEditDialogResult {
  name: string;
  colorData: string;
}

@Component({
  selector: 'app-color-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './color-edit-dialog.component.html',
  styleUrl: './color-edit-dialog.component.scss'
})
export class ColorEditDialogComponent {
  data = inject<ColorEditDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ColorEditDialogComponent>);

  name: string = '';
  colorData: string = '#000000';

  constructor() {
    this.name = this.data.name || '';
    this.colorData = this.data.colorData || '#000000';
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
    if (this.name.trim() && this.colorData) {
      this.dialogRef.close({
        name: this.name.trim(),
        colorData: this.colorData
      } as ColorEditDialogResult);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
