import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  eyeOutline
} from 'ionicons/icons';
import { AuthService } from '../auth.service';
import { RegisterRequest } from 'src/app/model/requests/registerRequest';
import { LocationService } from '../../services/location.service';

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

  private authService = inject(AuthService);
  private router = inject(Router);
  public navCtrl = inject(NavController);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private locationService = inject(LocationService);
  private currentYear = new Date().getFullYear();
  public isPasswordHidden: boolean = true;


  // UX Enhancement: Integrated the dynamic legal checkbox validator
  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    username: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(15)]],
    agreeToTerms: [false, [Validators.requiredTrue]] // Enforces checkbox interaction
  });

  constructor() {
    // Registered new contextual iconography mappings to prevent layout flashing errors
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
      eyeOffOutline
    });
  }

  ngOnInit(): void {
    this.locationService.getCurrentLocation();
  }



  async register() {



    if (this.registerForm.invalid) return; // Prevent submission block breaks
    const request = this.createRegisterRequest();

    console.log(request);
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
      latitude: location.lat,
      longitude: location.lng
    };
  }

  // Legal documentation workflow endpoints
  openTerms() {
    this.router.navigate(['/TermandConditions']);
    console.log('Navigate or display Terms Sheet Modal');
  }

  openPrivacy() {
    this.router.navigate(['/privacy-policy']);
    console.log('Navigate or display Privacy Sheet Modal');
  }

  saveNewUser(request: RegisterRequest) {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.registerNewUser(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created. Please verify the OTP sent to your email.';

        this.router.navigate(['/verify-otp'], {
          queryParams: { email: request.email }
        });
      },
      error: (err) => {
        this.isLoading = false;

        // On extrait la propriété 'error' ou 'validationError' de votre objet ErrorResponse
        if (err?.error && typeof err.error === 'object') {
          if (err.error.error) {
            // Capture "Email already exists" / "Username already exists"
            this.errorMessage = err.error.error;
          } else if (err.error.validationError && err.error.validationError.length > 0) {
            // Capture les erreurs de validation de champs (ex: @Valid)
            this.errorMessage = Array.from(err.error.validationError).join(', ');
          } else {
            this.errorMessage = 'An error occurred during registration.';
          }
        } else if (typeof err?.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Registration failed. Please check your network connection.';
        }

        console.error('Registration Error:', err);
      }
    });
  }

  togglePasswordVisibility() {
    this.isPasswordHidden = !this.isPasswordHidden;
  }
}
