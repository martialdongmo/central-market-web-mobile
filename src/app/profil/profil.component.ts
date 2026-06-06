import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, shieldCheckmark, bagOutline, heartOutline,
  locationOutline, cardOutline, settingsOutline, chevronForward, logOutOutline
} from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';
import { OrderService } from '../services/order.service';
import { Subscription } from 'rxjs';
import { UserResponse } from '../model/response/usersResponse';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit, OnDestroy {

  user:UserResponse | null = null;
  isLoggedIn = false;
  userName = '';
  userEmail = '';
  ordersCount = 0;
  get userInitial(): string { return this.userName.charAt(0).toUpperCase(); }

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    public navCtrl: NavController,
  ) {
    addIcons({
      personCircleOutline, shieldCheckmark, bagOutline, heartOutline,
      locationOutline, cardOutline, settingsOutline, chevronForward, logOutOutline
    });
  }

  ngOnInit() {


     this.me();

  }

   me():void{
    this.authService.me().subscribe({
      next: (response) => {
        this.user = response;
        console.log('User info:', response);
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
        alert('Failed to fetch user info. Check console for details.');
      }
    });
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  goToOrders() { this.navCtrl.navigateForward('/orders'); }

  logout() {
    this.authService.logout();
  }
}
