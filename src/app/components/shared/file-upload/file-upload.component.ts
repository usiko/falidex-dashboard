import { Component, input, output } from '@angular/core';
import { IUploadState } from './model';
import { UploadItemComponent } from './upload-item/upload-item.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [UploadItemComponent, MatButtonModule],
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {

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
    public file?: File;

    /**
     * current file error
     */
    public fileError?: string

    /**
     * file upload event with current file
     * @type {OutputEmitterRef<File>}
     */
    public fileUpload = output<File>();


    /**
     * cancel upload event output
     */
    public onCancel = output<void>();

    /**
     * back event output
     */
    public onBack = output<void>();

    /**
     * upload progress value
     */
    public uploadProgress?: number;


    /**
     * set the current file
     * @param {File} file
     */
    public onFileSelected(file?: File) {
        this.file = file;
    }

    /**
    *  set current file error
    * @param {?string} error
    */
    public onFileError(error?: string) {
        this.fileError = error;
    }

    /**
     * send upload event with current file
     */
    public upload() {
        if (this.file) {
            this.fileUpload.emit(this.file);
        }
    }

    /**
     * send cancel event
     */
    public cancel() {
        this.onCancel.emit();
    }

    /**
     * send back event
     */
    public back() {
        this.onBack.emit();
    }

    /**
     * clear current file
     */
    public clearFile() {
        this.file = undefined;
    }



}
