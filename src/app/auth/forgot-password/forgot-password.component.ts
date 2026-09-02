import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ForgotPasswordRequest } from 'src/app/core/model/requests/ForgotPasswordRequest';
import { AuthService } from '../auth.service';

/** ⚠️ Vérifiez que ce chemin correspond bien à la route déclarée pour
 *  ResetPasswordComponent dans votre configuration de routes. */
const RESET_PASSWORD_ROUTE = '/change-password';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

    const email = this.form.getRawValue().email.trim().toLowerCase();
    const request: ForgotPasswordRequest = { email };

    console.log('[ForgotPasswordComponent] submitting forgot-password for', email);

    this.authService.forgotPassword(request).subscribe({
      next: (response) => {
        console.log('[ForgotPasswordComponent] forgotPassword success:', response);
        this.loading.set(false);
        this.submitted.set(true);

        setTimeout(() => {
          this.router.navigate([RESET_PASSWORD_ROUTE], {
            queryParams: { email },
          });
        }, 1200);
      },
      error: (err) => {
        console.error('[ForgotPasswordComponent] forgotPassword failed:', err);
        this.loading.set(false);
        this.errorMessage.set(
          typeof err.error === 'string'
            ? err.error
            : "Une erreur est survenue. Veuillez réessayer.",
        );
      },
    });
  }
}