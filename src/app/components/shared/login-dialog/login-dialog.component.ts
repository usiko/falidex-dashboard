import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

export interface LoginDialogData {
  title?: string;
  username?: string;
}

export interface LoginDialogResult {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss'
})
export class LoginDialogComponent {
  data = inject<LoginDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<LoginDialogComponent>);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm: FormGroup;
  hidePassword = true;
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      username: [this.data?.username || '', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  get title(): string {
    return this.data?.title || 'Connexion';
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage.set(null);
      this.isLoading.set(true);
      
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogRef.close();
        },
        error: (error) => {
          this.isLoading.set(false);
          let errorMsg: string;
          
          // Vérifier si c'est une erreur 401 (Unauthorized)
          if (error?.status === 401) {
            errorMsg = 'Nom d\'utilisateur ou mot de passe incorrect.';
          } else {
            errorMsg = error?.error?.message || error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          }
          
          this.errorMessage.set(errorMsg);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
