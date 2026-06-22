import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehicleType } from 'src/app/model/enums/vehicle-type';
import { DriverService } from 'src/app/services/driver.service';
import { DriverRegistrationRequest } from 'src/app/model/requests/driver-registration-request';

@Component({
  selector: 'app-register-driver',
  templateUrl: './register-driver.component.html',
  styleUrls: ['./register-driver.component.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    ReactiveFormsModule
  ]
})
export class RegisterDriverComponent  implements OnInit {

  driverForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Extract enum values for the @for loop template loop
  readonly vehicleTypes = Object.values(VehicleType);

  private driverService = inject(DriverService);
  private fb = inject(FormBuilder);


  constructor() { }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Initializes the reactive form with explicit validation matchers
   */
  private initForm(): void {
    this.driverForm = this.fb.group({
      licencePlate: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern(/^[A-Z0-9- ]+$/i) // Alpha-numeric, spaces, and dashes
      ]],
      vehicleType: ['', [Validators.required]],
      privacyAccepted: [false, [Validators.requiredTrue]] // Must be explicitly checked
    });
  }

  /**
   * Handles form submission and triggers backend driver registration
   */
  onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    // Destructure to separate the privacy boolean from data sent to the API
    const { licencePlate, vehicleType } = this.driverForm.value;

    const request: DriverRegistrationRequest = { licencePlate, vehicleType };

    this.driverService.registerDriver(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Félicitations ${response.fullName}, votre compte chauffeur (${response.vehicleType}) a été validé !`;
        
        // Reset form state cleanly
        this.driverForm.reset({
          licencePlate: '',
          vehicleType: '',
          privacyAccepted: false
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || "Une erreur est survenue lors de l'enregistrement.";
      }
    });
  }

}
