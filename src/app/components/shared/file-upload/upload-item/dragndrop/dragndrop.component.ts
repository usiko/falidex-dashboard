import { E } from '@angular/cdk/keycodes';
import { Component, ElementRef, HostListener, inject, input, output, ViewChild, viewChild } from '@angular/core';

@Component({
    selector: 'app-dragndrop',
    standalone: true,
    imports: [],
    templateUrl: './dragndrop.component.html',
    styleUrl: './dragndrop.component.scss'
})
export class DragndropComponent {

    @ViewChild('container') container: ElementRef | undefined
    allowedFileType = input<string>();

    public fileDropped = output<FileList>();
    public fileOver = output<boolean>();
    public fileOverError = output<boolean>();
    public fileError = output<string | undefined>();

    public fileOverEv = false;
    public fileErrorEV = false;

    @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
        this.prevent(event);

        if (this.isAllowed(event)) {
            this.fileOverEv = true;
            this.fileErrorEV = false;
            this.fileOver.emit(true);
            this.fileOverError.emit(false)
        }
        else {
            this.fileErrorEV = true;
            this.fileOverEv = false;
            this.fileOver.emit(false)
            this.fileOverError.emit(true)
            this.fileError.emit('badFormatError')
        }

    }
    @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
        this.prevent(event);

        if (this.container && event.target === this.container.nativeElement) {
            this.fileOverEv = false;
            this.fileErrorEV = false;
            this.fileError.emit(undefined);
            this.fileOver.emit(false)
            this.fileOverError.emit(false)
        }

    }
    @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
        this.prevent(event);

        const files = event.dataTransfer?.files;
        this.fileErrorEV = false;
        this.fileOverEv = false;
        this.fileError.emit(undefined);
        this.fileOver.emit(false)
        this.fileOverError.emit(false)
        if (files && files?.length > 0 && this.isAllowed(event)) {
            this.fileDropped.emit(files)
        }

    }

    private prevent(event: Event) {
        event.preventDefault();
        event.stopPropagation()
    }

    private isAllowed(event: DragEvent) {
        const allowedFileType = this.allowedFileType();
        if (!allowedFileType) {
            return true;
        }
        else if (event.dataTransfer?.items[0].type) {
            const type = event.dataTransfer?.items[0].type;
            return allowedFileType.includes(type);
        }
        else {
            return false
        }
    }
}
