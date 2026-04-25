import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { IBaseCodeSpe } from '../../../models/data/base-data-models';

export interface CodeSpeEditDialogData {
  codeSpe?: IBaseCodeSpe;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-code-spe-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './code-spe-edit-dialog.component.html',
  styleUrl: './code-spe-edit-dialog.component.scss'
})
export class CodeSpeEditDialogComponent {
  data = inject<CodeSpeEditDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CodeSpeEditDialogComponent>);

  protected name: string;
  protected text: string;
  protected article: string;
  protected note: string;

  constructor() {
    // Initialiser les valeurs depuis les données
    const codeSpe = this.data.codeSpe;
    this.name = codeSpe?.name || '';
    this.text = codeSpe?.text || '';
    this.article = codeSpe?.article || '';
    this.note = codeSpe?.note || '';
  }

  get title(): string {
    return this.data.mode === 'add' ? 'Ajouter une spécificité' : 'Modifier la spécificité';
  }

  get isValid(): boolean {
    return this.name.trim() !== '' && this.text.trim() !== '';
  }

  onSave(): void {
    if (!this.isValid) return;

    const result: IBaseCodeSpe = {
      id: this.data.codeSpe?.id || `code-spe-${Date.now()}`,
      name: this.name.trim(),
      text: this.text.trim(),
      article: this.article.trim() || undefined,
      note: this.note.trim() || undefined
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
