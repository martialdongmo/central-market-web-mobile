import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VerifyOtpRequest } from 'src/app/model/requests/verifyOtpRequest';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
  imports: [IonContent, IonIcon, ReactiveFormsModule],
})
export class VerifyOtpComponent implements OnInit {

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  public navCtrl = inject(NavController);

  otpForm = this.fb.group({
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  isLoading = false;
  messageSuccess = '';
  messageError = '';

  constructor() { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];

      if (email) {
        this.otpForm.patchValue({ email });
      }
    });
  }

  onVerifyOtp() {
    this.isLoading = true;
    if (this.otpForm.invalid) {
      this.isLoading = false;
      return;
    }


    const request: VerifyOtpRequest = {
      email: this.otpForm.getRawValue().email!,
      code: this.otpForm.value.otp!
    };

    this.authService.verifyOtp(request).subscribe({
      next: (response) => {
        console.log('OTP verification successful', response);
        this.messageSuccess = 'OTP verified successfully!';
        this.messageError = '';
        this.isLoading = false;
        this.navCtrl.navigateRoot('/secure-app');
      },
      error: (err) => {
        console.error('OTP verification failed', err);
        this.messageError = 'Failed to verify OTP. Please try again.';
        this.isLoading = false;
      }
    });

  }

}
