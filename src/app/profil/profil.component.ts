import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  storefrontOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  bagHandleOutline,
  heartOutline,
  locationOutline,
  cardOutline,
  notificationsOutline,
  settingsOutline,
  helpCircleOutline,
  chevronForwardOutline,
  logOutOutline,
  mailOutline,
  timeOutline,
  lockClosedOutline,
  warningOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  copyOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserResponse } from '../model/response/usersResponse';
import { FooterComponent } from "../shares/footer/footer.component";
import { PushNotificationService } from '../services/push-notification.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, IonContent, IonIcon, FooterComponent],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ProfilComponent implements OnInit, OnDestroy {
 
  user: UserResponse | null = null;
  isLoggedIn = false;
  pushToken: string | null = null;
 
  /** Populate these from your order / wishlist / payment services */
  orderCount    = 0;
  wishlistCount = 0;
  savedCards    = 0;
 
  private subs: Subscription[] = [];
  private readonly pushNotificationService = inject(PushNotificationService);
 
  constructor(
    private authService: AuthService,
    public  navCtrl: NavController,
  ) {
    addIcons({
      storefrontOutline,
      personCircleOutline,
      shieldCheckmarkOutline,
      bagHandleOutline,
      heartOutline,
      locationOutline,
      cardOutline,
      notificationsOutline,
      settingsOutline,
      helpCircleOutline,
      chevronForwardOutline,
      logOutOutline,
      mailOutline,
      timeOutline,
      lockClosedOutline,
      warningOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      copyOutline,
    });
  }
 
  ngOnInit(): void {
    this.loadMe();
    this.loadPushToken();
  }
 
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
 
  private loadMe(): void {
    const sub = this.authService.me().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoggedIn = true;
      },
      error: (err) => console.error('Error fetching user info:', err),
    });
    this.subs.push(sub);
  }

  private async loadPushToken(): Promise<void> {
    try {
      this.pushToken = await this.pushNotificationService.getSavedToken();
    } catch (error) {
      console.error('Error loading push token:', error);
    }
  }

  copyToken(): void {
    if (this.pushToken) {
      navigator.clipboard.writeText(this.pushToken);
    }
  }
 
  logout(): void {
    console.log("logout")
    this.authService.logout();
  }
}
