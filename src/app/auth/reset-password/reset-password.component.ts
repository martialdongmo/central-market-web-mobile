import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ResetPasswordRequest } from 'src/app/core/model/requests/ResetPasswordRequest';
import { AuthService } from '../auth.service';


function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  constructor() {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    if (emailFromQuery) {
      this.form.patchValue({ email: emailFromQuery });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const request: ResetPasswordRequest = this.form.getRawValue();
    console.log('[ResetPasswordComponent] submitting reset-password for', request.email);

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        console.log('[ResetPasswordComponent] resetPassword success:', response);
        this.loading.set(false);
        this.successMessage.set('Password reset successfully. Redirecting to login…');

        setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      },
      error: (err) => {
        console.error('[ResetPasswordComponent] resetPassword failed:', err);
        this.loading.set(false);
        this.errorMessage.set(
          typeof err.error === 'string' ? err.error : 'Something went wrong. Please try again.',
        );
      },
    });
  }
}