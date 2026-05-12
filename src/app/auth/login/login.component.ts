import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, mailOutline, lockClosedOutline, flashOutline, alertCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMsg = '';
  private redirectTo = '';

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    addIcons({ arrowBackOutline, mailOutline, lockClosedOutline, flashOutline, alertCircleOutline });
    this.route.queryParams.subscribe(p => { this.redirectTo = p['redirect'] || ''; });
  }

  fillDemo() {
    this.email = 'demo@centralmarket.cm';
    this.password = 'demo1234';
  }

  async login() {
    if (!this.email || !this.password) { this.errorMsg = 'Veuillez remplir tous les champs.'; return; }
    this.isLoading = true;
    this.errorMsg = '';
    try {
      await this.authService.login(this.email, this.password);
      if (this.redirectTo === 'checkout') {
        this.navCtrl.navigateForward('/checkout');
      } else {
        this.navCtrl.navigateRoot('/profile');
      }
    } catch {
      this.errorMsg = 'Identifiants incorrects. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
    }
  }
}
