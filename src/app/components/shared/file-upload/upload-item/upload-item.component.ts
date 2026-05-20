import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IUploadState } from '../model';
import { CommonModule } from '@angular/common';
import { DragndropComponent } from './dragndrop/dragndrop.component';
import { InputFileComponent } from './input-file/input-file.component';
@Component({
    selector: 'app-upload-item',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatProgressSpinnerModule, CommonModule, DragndropComponent, InputFileComponent],
    templateUrl: './upload-item.component.html',
    styleUrl: './upload-item.component.scss'
})
export class UploadItemComponent {
    /**
     * current upload state
     * @type {InputSignal<IUploadState | undefined>}
     */
    public uploadState = input<IUploadState>()

    /**
     * allowed file type ("text/csv, image/png")
     */
    public allowedFileType = input<string>();

    /**
     * @type {File}
     * current file
     */
    public file = input<File>();

    /**
     * current file error
     */
    public fileError = output<string | undefined>();

    /**
     * file changed event with current file
     * @type {OutputEmitterRef<File>}
     */
    public fileChanged = output<File | undefined>();


    public fileOver = false;
    public fileOverError = false;




    /**
     * set the current file
     * @param {File} file
     */
    public onFilesSelected(files?: FileList) {
        const file = files ? files[0] : undefined;
        const allowedFileType = this.allowedFileType();
        if (allowedFileType && file) {
            if (file.type && allowedFileType.includes(file.type)) {
                this.fileChanged.emit(file)
            }
            else {
                this.fileError.emit('badformat')
            }
        } else {
            this.fileChanged.emit(file)
        }
    }

    /**
    *  send current file error
    * @param {?string} error
    */
    public onFileError(error?: string) {
        this.fileError.emit(error)
    }



    /**
     * clear current file
     */
    public clear() {
        this.fileChanged.emit(undefined);
        this.fileError.emit(undefined)
    }

    public onFileOver(stat: boolean) {
        this.fileOver = stat;
    }

    public onFileOverError(stat: boolean) {
        this.fileOverError = stat;
    }

}
