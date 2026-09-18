import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  alertCircleOutline,
  atOutline,
  callOutline,
  checkmarkCircleOutline,
  eyeOffOutline,
  eyeOutline,
  cashOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { AuthService } from '../auth.service';
import { RegisterRequest } from 'src/app/core/model/requests/registerRequest';
import { LocationService } from '../../core/services/location.service';
import { Currency } from 'src/app/core/model/enums/currency-type';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isPasswordHidden = true;

  // Wizard state
  currentStep = signal<number>(1);
  totalSteps = 3;
  progressPercent = computed(() => (this.currentStep() / this.totalSteps) * 100);

  currencies = Object.values(Currency);

  private authService = inject(AuthService);
  private router = inject(Router);
  public navCtrl = inject(NavController);
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);

  private readonly stepFields: Record<number, string[]> = {
    1: ['firstName', 'lastName', 'username'],
    2: ['email', 'phoneNumber', 'currency'],
    3: ['password', 'agreeToTerms'],
  };

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(15)]],
    currency: [Currency.XAF, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    agreeToTerms: [false, [Validators.requiredTrue]],
  });

  constructor() {
    addIcons({
      arrowBackOutline,
      personOutline,
      mailOutline,
      lockClosedOutline,
      alertCircleOutline,
      atOutline,
      callOutline,
      checkmarkCircleOutline,
      eyeOutline,
      eyeOffOutline,
      cashOutline,
      chevronForwardOutline
    });
  }

  ngOnInit(): void {
    this.locationService.getCurrentLocation();
  }

  isCurrentStepValid(): boolean {
    return this.stepFields[this.currentStep()].every(
      (name) => this.registerForm.get(name)?.valid
    );
  }

  isFieldInvalid(name: string): boolean {
    const control = this.registerForm.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  goNext() {
    this.stepFields[this.currentStep()].forEach((name) =>
      this.registerForm.get(name)?.markAsTouched()
    );
    if (!this.isCurrentStepValid()) return;
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  goBack() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    } else {
      this.navCtrl.back();
    }
  }

  async register() {
    if (this.registerForm.invalid) return;
    const request = this.createRegisterRequest();
    this.saveNewUser(request);
  }

  public createRegisterRequest(): RegisterRequest {
    const location = this.locationService.asStrings();
    return {
      firstName: this.registerForm.value.firstName!,
      lastName: this.registerForm.value.lastName!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      username: this.registerForm.value.username!,
      phoneNumber: this.registerForm.value.phoneNumber!,
      currency: this.registerForm.value.currency!,
      latitude: location.lat,
      longitude: location.lng
    };
  }

  openTerms() {
    this.router.navigate(['/TermandConditions']);
  }

  openPrivacy() {
    this.router.navigate(['/privacy-policy']);
  }

  saveNewUser(request: RegisterRequest) {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.registerNewUser(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Compte créé. Veuillez saisir le code OTP envoyé par email.';
        this.router.navigate(['/verify-otp'], {
          queryParams: { email: request.email }
        });
      },
      error: (err) => {
        this.isLoading = false;

        if (err?.error && typeof err.error === 'object') {
          if (err.error.error) {
            this.errorMessage = err.error.error;
          } else if (err.error.validationError && err.error.validationError.length > 0) {
            this.errorMessage = Array.from(err.error.validationError).join(', ');
          } else {
            this.errorMessage = "Une erreur est survenue lors de l'inscription.";
          }
        } else if (typeof err?.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Inscription échouée. Veuillez vérifier votre connexion.';
        }

        console.error('Registration Error:', err);
      }
    });
  }

  togglePasswordVisibility() {
    this.isPasswordHidden = !this.isPasswordHidden;
  }
}