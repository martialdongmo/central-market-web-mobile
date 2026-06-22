
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonRouterOutlet, IonTabBar, IonTabButton,
  IonIcon, IonLabel, NavController,AlertController
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

import { AuthService } from './auth/auth.service';
import { UserResponse } from './model/response/usersResponse';


const ROLE_DELIVERY = 'DELIVERY';
const ROLE_ADMIN    = 'ADMIN';
const ROLE_MANAGER  = 'MANAGER';
 
/** Roles that may validate / confirm delivery orders */
const CAN_VALIDATE_ROLES: string[] = [ROLE_DELIVERY, ROLE_ADMIN, ROLE_MANAGER];
 
/** External shop-creation portal */
const CREATE_SHOP_URL = 'https://kapexpert.cloud:3001/create-shop';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
})

export class AppComponent {

  private authService = inject(AuthService);
  private navCtrl  = inject(NavController);
  private alertCtrl = inject(AlertController);

  menuOpen          = false;
  isLoggedIn        = false;
  userName          = '';
  currentRole       = '';   // displayed in the user row, e.g. "Customer", "Delivery"
  canValidateOrders = false;
 
  private subs: Subscription[] = [];
  
  constructor( ) {
    addIcons({
        storefrontOutline, locationOutline, flameOutline, cartOutline,
      menuOutline, closeOutline, bagHandleOutline, personOutline,
      bicycleOutline, chatbubbleEllipsesOutline, helpCircleOutline,
      chevronForwardOutline, logOutOutline, openOutline,
      checkmarkCircleOutline, personCircleOutline
    });
  }
ngOnInit(): void {
    const sub = this.authService.me().subscribe((user: UserResponse | null) => {
      if (user) {
        this.isLoggedIn        = true;
        this.userName          = `${user.firstName} ${user.lastName}`;
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
 
  /* ── Menu control ────────────────────────────────────────────────────────── */
 
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }
 
  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }
 
  /* ── Navigation ─────────────────────────────────────────────────────────── */
 
  goToLogin(): void {
    this.closeMenu();
    this.navCtrl.navigateRoot('/login');
  }
 
  logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }
 
  /**
   * Opens the external shop-creation portal.
   *
   * Auth check rationale:
   *  - If not logged in: show an in-app alert instead of silently opening
   *    an external tab that will immediately redirect to a foreign login page.
   *    Better UX — user stays in the app and understands why.
   *  - If logged in: open in a new tab. The JWT is NOT appended to the URL
   *    (security). The external app on kapexpert.cloud:3001 shares the same
   *    domain so the auth cookie is sent automatically. If you're JWT-only
   *    (no cookie), pass the token via postMessage after the tab loads instead.
   */
  async openCreateShop(): Promise<void> {
    this.closeMenu();
 
    if (!this.isLoggedIn) {
      const alert = await this.alertCtrl.create({
        header:  'Sign in required',
        message: 'You need to be signed in to create a shop. Would you like to sign in now?',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Sign in',
            cssClass: 'alert-btn-primary',
            handler: () => this.navCtrl.navigateRoot('/secure-app'),
          },
        ],
      });
      await alert.present();
      return;
    }
 
    // Authenticated: open portal in a new tab
    window.open(CREATE_SHOP_URL, '_blank', 'noopener,noreferrer');
  }
 
  /* ── Role helpers ────────────────────────────────────────────────────────── */
 
  /**
   * Checks whether the user's role string matches any of the allowed roles.
   *
   * Backend sends roles as a single string: "USER", "DELIVERY", "ADMIN"…
   * We do an EXACT match (not substring) to avoid false positives.
   *
   * If the backend ever upgrades to an array (e.g. ["DELIVERY","ADMIN"]),
   * this method handles that too — just change the type in UserResponse.
   */
  private hasAnyRole(userRoles: string | string[], allowed: string[]): boolean {
    // Normalise to array regardless of backend format
    const roles = Array.isArray(userRoles)
      ? userRoles
      : [userRoles];
 
    return roles.some(r => allowed.includes(r.trim().toUpperCase()));
  }
 
  /**
   * Converts "DELIVERY" → "Delivery", "USER" → "Customer", etc.
   * Used only for display in the user greeting row.
   */
  private formatRole(roles: string | string[]): string {
    const raw = Array.isArray(roles) ? roles[0] : roles;
    if (!raw) return 'Customer';
 
    const label = raw.trim().toUpperCase();
 
    const displayMap: Record<string, string> = {
      USER:     'Customer',
      DELIVERY: 'Delivery Driver',
      ADMIN:    'Administrator',
      MANAGER:  'Manager',
      SELLER:   'Seller',
    };
 
    return displayMap[label] ?? (label.charAt(0) + label.slice(1).toLowerCase());
  }
}