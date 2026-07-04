import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { DiffOption } from '../../models/diff-row.model';

export interface EntityPickerDialogData {
  title: string;
  options: DiffOption[];
  currentId: string | null;
}

@Component({
  selector: 'app-entity-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule, MatListModule, MatButtonModule],
  templateUrl: './entity-picker-dialog.component.html',
  styleUrl: './entity-picker-dialog.component.scss'
})
export class EntityPickerDialogComponent {
  protected readonly data = inject<EntityPickerDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EntityPickerDialogComponent, DiffOption>);

  protected readonly searchTerm = signal('');

  protected readonly filteredOptions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.data.options;
    return this.data.options.filter((option) => option.name.toLowerCase().includes(term));
  });

  protected onSelect(option: DiffOption): void {
    this.dialogRef.close(option);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
