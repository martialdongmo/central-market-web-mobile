import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, shieldCheckmark, bagOutline, heartOutline,
  locationOutline, cardOutline, settingsOutline, chevronForward, logOutOutline
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit, OnDestroy {
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
    this.subs.push(
      this.authService.user$.subscribe(user => {
        this.isLoggedIn = !!user;
        this.userName  = user?.name ?? '';
        this.userEmail = user?.email ?? '';
      }),
      this.orderService.orders$.subscribe(orders => {
        this.ordersCount = orders.length;
      })
    );
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  goToOrders() { this.navCtrl.navigateForward('/orders'); }

  logout() {
    this.authService.logout();
  }
}
