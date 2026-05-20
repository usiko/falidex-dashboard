import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-input-file',
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: './input-file.component.html',
    styleUrl: './input-file.component.scss'
})
export class InputFileComponent {

    /**
     * allowed file type ("text/csv, image/png")
     */
    public allowedFileType = input<string>();

    /**
     * file changed event with current file
     * @type {OutputEmitterRef<File>}
     */
    public fileChanged = output<FileList | undefined>();

    /**
    * get the current file of input
    * @param {File} file
    */
    public onFileSelected(event: Event) {
        const element = event.currentTarget as HTMLInputElement;
        this.fileChanged.emit(element.files ?? undefined)
    }
}
