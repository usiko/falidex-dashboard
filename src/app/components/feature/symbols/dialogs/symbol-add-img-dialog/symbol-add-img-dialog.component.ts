import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../../../../services/data/data.service';
import { IUploadState } from '../../../../shared/file-upload/model';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';

export interface SymbolAddImgDialogData {
  symbolId: string;
}

@Component({
  selector: 'app-symbol-add-img-dialog',
  standalone: true,
  imports: [MatDialogModule, FileUploadComponent],
  templateUrl: './symbol-add-img-dialog.component.html',
  styleUrl: './symbol-add-img-dialog.component.scss'
})
export class SymbolAddImgDialogComponent {
  private readonly data = inject<SymbolAddImgDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SymbolAddImgDialogComponent>);
  private readonly dataService = inject(DataService);

  protected readonly uploadState = signal<IUploadState | undefined>(undefined);

  onFileUpload(file: File) {
    this.uploadState.set({ state: 'running' });
    this.dataService.addSymboleImg(this.data.symbolId, file).subscribe({
      next: (newImgs) => {
        this.dialogRef.close(newImgs);
      },
      error: () => {
        this.uploadState.set({ state: 'error', message: "Erreur lors de l'upload de l'image" });
      }
    });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
