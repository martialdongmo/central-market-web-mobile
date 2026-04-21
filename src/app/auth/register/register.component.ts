import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personOutline, mailOutline, lockClosedOutline, alertCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; confirm = '';
  isLoading = false; errorMsg = '';
  private redirectTo = '';

  constructor(
    public navCtrl: NavController,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    addIcons({ arrowBackOutline, personOutline, mailOutline, lockClosedOutline, alertCircleOutline });
    this.route.queryParams.subscribe(p => { this.redirectTo = p['redirect'] || ''; });
  }

  async register() {
    if (!this.name || !this.email || !this.password) { this.errorMsg = 'Veuillez remplir tous les champs.'; return; }
    if (this.password !== this.confirm) { this.errorMsg = 'Les mots de passe ne correspondent pas.'; return; }
    this.isLoading = true; this.errorMsg = '';
    try {
      await this.authService.register(this.name, this.email, this.password);
      if (this.redirectTo === 'checkout') this.navCtrl.navigateForward('/checkout');
      else this.navCtrl.navigateRoot('/profile');
    } catch {
      this.errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
    } finally { this.isLoading = false; }
  }
}
