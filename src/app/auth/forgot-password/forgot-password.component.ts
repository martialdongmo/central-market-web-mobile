import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ForgotPasswordRequest } from 'src/app/core/model/requests/ForgotPasswordRequest';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const request: ForgotPasswordRequest = { email: this.form.getRawValue().email };
    console.log('[ForgotPasswordComponent] submitting forgot-password for', request.email);

    this.authService.forgotPassword(request).subscribe({
      next: (response) => {
        console.log('[ForgotPasswordComponent] forgotPassword success:', response);
        this.loading.set(false);
        this.submitted.set(true);

        setTimeout(() => {
          this.router.navigate(['/change-password'], {
            queryParams: { email: request.email },
          });
        }, 1200);
      },
      error: (err) => {
        console.error('[ForgotPasswordComponent] forgotPassword failed:', err);
        this.loading.set(false);
        this.errorMessage.set(
          typeof err.error === 'string' ? err.error : 'Something went wrong. Please try again.',
        );
      },
    });
  }
}