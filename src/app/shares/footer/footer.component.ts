import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonTabBar, IonTabButton, IonIcon, IonLabel,
  NavController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  storefrontOutline, locationOutline, flameOutline, cartOutline,
  menuOutline, closeOutline, bagHandleOutline, personOutline,
  bicycleOutline, chatbubbleEllipsesOutline, helpCircleOutline,
  chevronForwardOutline, logOutOutline, openOutline,
  checkmarkCircleOutline, personCircleOutline, globeOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserResponse } from 'src/app/model/response/usersResponse';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

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
    CommonModule, RouterLink, RouterLinkActive,
    IonTabBar, IonTabButton, IonIcon, IonLabel,
    TranslatePipe,
  ],
})
export class FooterComponent implements OnInit, OnDestroy {

  private readonly authService = inject(AuthService);
  private readonly navCtrl     = inject(NavController);
  private readonly alertCtrl   = inject(AlertController);
  private readonly translate   = inject(TranslateService);

  menuOpen          = false;
  isLoggedIn        = false;
  userName          = '';
  currentRole       = '';
  canValidateOrders = false;
  currentLang: 'fr' | 'en' = 'fr';

  private subs: Subscription[] = [];

  constructor() {
    addIcons({
      storefrontOutline, locationOutline, flameOutline, cartOutline,
      menuOutline, closeOutline, bagHandleOutline, personOutline,
      bicycleOutline, chatbubbleEllipsesOutline, helpCircleOutline,
      chevronForwardOutline, logOutOutline, openOutline,
      checkmarkCircleOutline, personCircleOutline, globeOutline
    });

    // Initialize language from storage or default
    const savedLang = localStorage.getItem('preferred_language') as 'fr' | 'en';
    if (savedLang) {
      this.currentLang = savedLang;
      this.translate.use(savedLang);
    } else {
      const deviceLang = navigator.language.startsWith('fr') ? 'fr' : 'en';
      this.currentLang = deviceLang;
      this.translate.use(deviceLang);
      localStorage.setItem('preferred_language', deviceLang);
    }
  }

  ngOnInit(): void {
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

  // ── Language Switching ──────────────────────────────────────────────
  switchLanguage(lang: 'fr' | 'en'): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('preferred_language', lang);
    this.closeMenu();
  }

  // ── Menu ──────────────────────────────────────────────────────────────────
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }

  // ── Navigation ────────────────────────────────────────────────────────
  goToLogin(): void {
    this.closeMenu();
    this.navCtrl.navigateRoot('/secure-app');
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  async openCreateShop(): Promise<void> {
    this.closeMenu();
    if (!this.isLoggedIn) {
      const alert = await this.alertCtrl.create({
        header:  'Connexion requise',
        message: 'Vous devez être connecté pour créer une boutique.',
        buttons: [
          { text: 'Annuler', role: 'cancel' },
          { text: 'Se connecter', cssClass: 'alert-btn-primary',
            handler: () => this.goToLogin() },
        ],
      });
      await alert.present();
      return;
    }
    window.open(CREATE_SHOP_URL, '_blank', 'noopener,noreferrer');
  }

  // ── Role helpers ──────────────────────────────────────────────────────
  private hasAnyRole(userRoles: string | string[], allowed: readonly string[]): boolean {
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
    return roles.some(r => allowed.includes(r.trim().toUpperCase() as never));
  }

  private formatRole(roles: string | string[]): string {
    const raw   = Array.isArray(roles) ? roles[0] : roles;
    const upper = raw?.trim().toUpperCase() ?? '';
    return ROLE_DISPLAY[upper] ?? (upper.charAt(0) + upper.slice(1).toLowerCase());
  }
}
