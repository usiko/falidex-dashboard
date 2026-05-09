import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface InputDialogData {
  title: string;
  message?: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  cancelText?: string;
  multiline?: boolean;
}

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.scss'
})
export class InputDialogComponent {
  data = inject<InputDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<InputDialogComponent>);

  inputValue: string = '';

  constructor() {
    this.inputValue = this.data.initialValue || '';
  }

  get title(): string {
    return this.data.title;
  }

  get placeholder(): string {
    return this.data.placeholder || '';
  }

  get confirmText(): string {
    return this.data.confirmText || 'Créer';
  }

  get cancelText(): string {
    return this.data.cancelText || 'Annuler';
  }

  get multiline(): boolean {
    return this.data.multiline || false;
  }

  onConfirm(): void {
    if (this.inputValue.trim()) {
      this.dialogRef.close(this.inputValue.trim());
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
