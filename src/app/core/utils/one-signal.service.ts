import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';
import { environment } from 'src/environments/environment.development';


@Injectable({ providedIn: 'root' })
export class OneSignalService {

  private router = inject(Router);
  private initialized = false;

  private get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /** À appeler dans `AppComponent.ngOnInit` */
  init(): void {
    if (!this.isNative || this.initialized) return;

    // Log de debug uniquement en mode développement
    if (!environment.production) {
      OneSignal.Debug.setLogLevel(6);
    }

    // 1. Initialisation de OneSignal
    OneSignal.initialize(environment.ONESIGNAL_APP_ID);

    // 2. Demande de permission pour les notifications (Android 13+ & iOS)
    OneSignal.Notifications.requestPermission(true);

    // 3. Gestion du clic sur une notification (Redirection)
    this.setupNotificationClickListener();

    this.initialized = true;
  }

  /** Écoute le clic sur les notifications pour effectuer une redirection */
  private setupNotificationClickListener(): void {
    OneSignal.Notifications.addEventListener('click', (event) => {
      const additionalData = event.notification.additionalData as Record<string, unknown> | undefined;

      // Exemple : Si la notification contient une propriété { route: '/details/123' }
      if (additionalData && typeof additionalData['route'] === 'string') {
        this.router.navigateByUrl(additionalData['route']);
      }
    });
  }

  /** Lie l'appareil à l'utilisateur connecté (external_id) */
  login(externalId: string): void {
    if (!this.isNative) return;
    OneSignal.login(externalId);
  }

  /** Dissocie l'appareil de l'utilisateur (à appeler au logout) */
  logout(): void {
    if (!this.isNative) return;
    OneSignal.logout();
  }
}