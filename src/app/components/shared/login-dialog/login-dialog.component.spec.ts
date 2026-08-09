import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoginDialogComponent } from './login-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../../services/auth/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockAuthService: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockAuthService = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    expect(component.loginForm.valid).toBeFalsy();
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'test1234'
    });
    
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('123');
    
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    passwordControl?.setValue('1234');
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('should close dialog with credentials on submit', () => {
    mockAuthService.login.mockReturnValue(of({}));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    component.loginForm.patchValue({
      username: '',
      password: ''
    });
    
    component.onSubmit();
    
    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should display error message on login failure', () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.login.mockReturnValue(throwError(() => ({ message: errorMessage })));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage()).toBe(errorMessage);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should set loading state during login', () => {
    mockAuthService.login.mockReturnValue(of({}));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    
    expect(component.isLoading()).toBeFalsy();
    
    component.onSubmit();
    
    expect(component.isLoading()).toBeFalsy(); // Should be false after completion
  });

  it('should clear error message on new submit', () => {
    component.errorMessage.set('Previous error');
    mockAuthService.login.mockReturnValue(of({}));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage()).toBeNull();
  });

  it('should close dialog with null on cancel', () => {
    component.onCancel();
    
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeFalsy();
    
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeTruthy();
  });
});
