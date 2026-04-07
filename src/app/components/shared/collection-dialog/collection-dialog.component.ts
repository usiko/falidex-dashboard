import { Component, inject, Type } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface CollectionDialogData {
  title: string;
  collectionComponent: Type<any>;
}

@Component({
  selector: 'app-collection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './collection-dialog.component.html',
  styleUrl: './collection-dialog.component.scss'
})
export class CollectionDialogComponent<T> {
  data = inject<CollectionDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CollectionDialogComponent<T>>);
  
  protected selectedItem: T | null = null;

  onItemSelected(item: T): void {
    this.selectedItem = item;
  }

  onConfirm(): void {
    if (this.selectedItem) {
      this.dialogRef.close(this.selectedItem);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
