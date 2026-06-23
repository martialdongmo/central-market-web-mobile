import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
   IonTabBar, IonTabButton,
  IonIcon, IonLabel, NavController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  storefrontOutline, locationOutline, flameOutline, cartOutline,
  menuOutline, closeOutline, bagHandleOutline, personOutline,
  bicycleOutline, chatbubbleEllipsesOutline, helpCircleOutline,
  chevronForwardOutline, logOutOutline, openOutline,
  checkmarkCircleOutline, personCircleOutline,
} from 'ionicons/icons';

import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserResponse } from 'src/app/model/response/usersResponse';




// ── Constants ──────────────────────────────────────────────────────────────
const CAN_VALIDATE_ROLES = ['DELIVERY', 'ADMIN', 'MANAGER'] as const;
const CREATE_SHOP_URL    = 'https://kapexpert.cloud:3001/create-shop';
 
const ROLE_DISPLAY: Record<string, string> = {
  USER:     'Customer',
  DELIVERY: 'Delivery Driver',
  ADMIN:    'Administrator',
  MANAGER:  'Manager',
  SELLER:   'Seller',
};


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],

})
export class FooterComponent  implements OnInit, OnDestroy {
 
  // ── Services ───────────────────────────────────────────────────────────────
  private readonly authService = inject(AuthService);
  private readonly navCtrl     = inject(NavController);
  private readonly alertCtrl   = inject(AlertController);
 
  // ── State ──────────────────────────────────────────────────────────────────
  menuOpen          = false;
  isLoggedIn        = false;
  userName          = '';
  currentRole       = '';
  canValidateOrders = false;
 
  private subs: Subscription[] = [];
 
  constructor() {
    addIcons({
      storefrontOutline, locationOutline, flameOutline, cartOutline,
      menuOutline, closeOutline, bagHandleOutline, personOutline,
      bicycleOutline, chatbubbleEllipsesOutline, helpCircleOutline,
      chevronForwardOutline, logOutOutline, openOutline,
      checkmarkCircleOutline, personCircleOutline,
    });
  }
 
  // ── Lifecycle ──────────────────────────────────────────────────────────────
 
  ngOnInit(): void {
    // React to auth state changes — no HTTP call, stream already populated
    // by AuthService.loadCurrentUser() called from AppComponent on boot.
    const sub = this.authService.currentUser$.subscribe((user: UserResponse | null) => {
      if (user) {
        this.isLoggedIn        = true;
        this.userName          = `${user.firstName} ${user.lastName}`.trim();
        this.currentRole       = this.formatRole(user.roles);
        this.canValidateOrders = this.hasAnyRole(user.roles, CAN_VALIDATE_ROLES);
      } else {
        this.isLoggedIn        = false;
        this.userName          = '';
        this.currentRole       = '';
        this.canValidateOrders = false;
      }
    });
    this.subs.push(sub);
  }
 
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
 
  // ── Menu control ───────────────────────────────────────────────────────────
 
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }
 
  /** Close the menu when the user presses Escape (web / tablet). */
  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }
 
  // ── Navigation ─────────────────────────────────────────────────────────────
 
  goToLogin(): void {
    this.closeMenu();
    this.navCtrl.navigateRoot('/secure-app');
  }
 
  logout(): void {
    this.closeMenu();
    this.authService.logout();
    // AuthService.logout() calls window.location.href = '/secure-app'
  }
 
  /**
   * Open the external shop portal.
   * Unauthenticated users get an in-app alert instead of a foreign redirect.
   */
  async openCreateShop(): Promise<void> {
    this.closeMenu();
 
    if (!this.isLoggedIn) {
      const alert = await this.alertCtrl.create({
        header:  'Sign in required',
        message: 'You need to be signed in to create a shop.',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Sign in',
            cssClass: 'alert-btn-primary',
            handler: () => this.goToLogin(),
          },
        ],
      });
      await alert.present();
      return;
    }
 
    window.open(CREATE_SHOP_URL, '_blank', 'noopener,noreferrer');
  }
 
  // ── Role helpers ───────────────────────────────────────────────────────────
 
  private hasAnyRole(
    userRoles: string | string[],
    allowed: readonly string[],
  ): boolean {
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
    return roles.some(r => allowed.includes(r.trim().toUpperCase() as never));
  }
 
  private formatRole(roles: string | string[]): string {
    const raw   = Array.isArray(roles) ? roles[0] : roles;
    const upper = raw?.trim().toUpperCase() ?? '';
    return ROLE_DISPLAY[upper] ?? (upper.charAt(0) + upper.slice(1).toLowerCase());
  }
}