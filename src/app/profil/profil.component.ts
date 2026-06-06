import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, shieldCheckmark, bagOutline, heartOutline,
  locationOutline, cardOutline, settingsOutline, chevronForward, logOutOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { UserResponse } from '../model/response/usersResponse';
import { CustomerOrderService } from '../services/order.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit, OnDestroy {

  user: UserResponse | null = null;
  ordersCount = 0;

  get userInitial(): string {
    return (this.user?.firstName ?? this.user?.lastName ?? '?').charAt(0).toUpperCase();
  }

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private orderService: CustomerOrderService,
    public navCtrl: NavController,
  ) {
    addIcons({
      personCircleOutline, shieldCheckmark, bagOutline, heartOutline,
      locationOutline, cardOutline, settingsOutline, chevronForward, logOutOutline,
    });
  }

  ngOnInit(): void {
    this.me();
    this.loadOrdersCount();
  }

  me(): void {
    this.authService.me().subscribe({
      next: (response) => { this.user = response; },
      error: (err) => { console.error('Error fetching user info:', err); },
    });
  }

  private loadOrdersCount(): void {
    const sub = this.orderService
      .getMyOrders({ page: 0, size: 1 })
      .subscribe(page => { this.ordersCount = page.totalElements; });
    this.subs.push(sub);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  goToOrders(): void { this.navCtrl.navigateForward('/orders'); }

  logout(): void { this.authService.logout(); }
}