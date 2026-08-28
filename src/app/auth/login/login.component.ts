import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
   imports: [ IonContent, FormsModule, IonButton],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
}
)
export class LoginComponent {
  
  currentYear: any;


  constructor(
    private auth: AuthService,
    private router: Router,
  ) { 
    this.currentYear = new Date().getFullYear();
  }



  onLogin() {
    this.auth.login();
  }


  goRegister() { this.router.navigate(['/register']); }


  onForgetPassword() {
    this.router.navigate(['/forgot-password'])
  }
}
