import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonItem, IonIcon, IonInput, IonSelect, IonSelectOption,
  IonCheckbox, IonButton, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bicycleOutline, cardOutline, carSportOutline, checkmarkCircleOutline,
  alertCircleOutline, cashOutline, timeOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { VehicleType } from 'src/app/core/model/enums/vehicle-type';

import { DriverRegistrationRequest } from 'src/app/core/model/requests/driver-registration-request';
import { FooterComponent } from "src/app/shared/footer/footer.component";
import { DriverService } from 'src/app/core/services/driver.service';
import { LocationService } from 'src/app/core/services/location.service';

@Component({
  selector: 'app-register-driver',
  templateUrl: './register-driver.component.html',
  styleUrls: ['./register-driver.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
    IonContent, IonItem, IonIcon, IonInput, IonSelect, IonSelectOption,
    IonCheckbox, IonButton, IonSpinner,
    FooterComponent
],
})
export class RegisterDriverComponent implements OnInit {

  driverForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  readonly vehicleTypes = Object.values(VehicleType);

  private readonly driverService = inject(DriverService);
  private locationService = inject(LocationService);

  private readonly fb = inject(FormBuilder);

  constructor() {
    addIcons({
      bicycleOutline, cardOutline, carSportOutline, checkmarkCircleOutline,
      alertCircleOutline, cashOutline, timeOutline, shieldCheckmarkOutline,
    });
    this.locationService.getCurrentLocation();
  }

  ngOnInit(): void {
    this.driverForm = this.fb.group({
      licencePlate: ['', [Validators.required, Validators.minLength(4),
      Validators.maxLength(15), Validators.pattern(/^[A-Z0-9\- ]+$/i)]],
      vehicleType: ['', [Validators.required]],
      privacyAccepted: [false, [Validators.requiredTrue]],
    });
  }

  // ── Getters — used in template instead of driverForm.get('...') ─────────
  // These return AbstractControl so .touched / .valid / .invalid all work
  get licencePlate() { return this.driverForm.get('licencePlate')!; }
  get vehicleType() { return this.driverForm.get('vehicleType')!; }
  get privacyAccepted() { return this.driverForm.get('privacyAccepted')!; }

  // ── Submit ─────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { licencePlate, vehicleType } = this.driverForm.value;
    const request: DriverRegistrationRequest = { licencePlate, vehicleType };

    this.driverService.registerDriver(request).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage =
          `Félicitations ${res.fullName} ! Votre compte livreur (${res.vehicleType}) a été validé.`;
        this.driverForm.reset({ licencePlate: '', vehicleType: '', privacyAccepted: false });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? "Une erreur est survenue. Veuillez réessayer.";
      },
    });
  }
}