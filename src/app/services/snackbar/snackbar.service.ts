import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    private snackBar = inject(MatSnackBar);

    success(message: string, duration: number = 3000): void {
        this.snackBar.open(message, '✓', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-success']
        });
    }

    error(message: string, duration: number = 5000): void {
        this.snackBar.open(message, '✕', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-error']
        });
    }

    info(message: string, duration: number = 3000): void {
        this.snackBar.open(message, 'ℹ', {
            duration,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-info']
        });
    }
}
