import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personOutline, mailOutline, lockClosedOutline, alertCircleOutline } from 'ionicons/icons';
import { AuthService } from '../auth.service';
import { RegisterRequest } from 'src/app/model/requests/registerRequest';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  isLoading = false; 
  errorMessage:string = '';
  successMessage:string='';

  private authService = inject(AuthService);
  private router = inject(Router);
  public navCtrl = inject(NavController);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private currentYear = new Date().getFullYear();
  private locationService = inject(LocationService);
  
  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
     lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    username: ['', [Validators.required]],
     phoneNumber: ['', [Validators.required, Validators.maxLength(15)]]
  });


  constructor(
   ) {
    addIcons({ arrowBackOutline, personOutline, mailOutline, lockClosedOutline, alertCircleOutline });
   
  }

  async register() {
    const request = this.createRegisterRequest();
    this.saveNewUser(request);

  }

  public createRegisterRequest(): RegisterRequest {
    return {
      firstName: this.registerForm.value.firstName!,
      lastName: this.registerForm.value.lastName!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      username: this.registerForm.value.username!,
      phoneNumber: this.registerForm.value.phoneNumber!,
      latitude: this.locationService.latitude(),
      longitude: this.locationService.longitude()
    };  }

    saveNewUser(request: RegisterRequest) {

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.registerNewUser(request).subscribe({
      next: (response) => {

        this.isLoading = false;

        this.successMessage =
          'Account created. Please verify the OTP sent to your email.';

        this.router.navigate(['/verify-otp'], {
          queryParams: { email: request.email }
        });
      },

      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Registration failed. Try again.';
        console.error(err);
      }
    });
  }

    

}
