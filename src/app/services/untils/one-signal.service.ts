import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';

import { environment } from 'src/environments/environment.development';

@Injectable({ providedIn: 'root' })
export class OneSignalService {

  private initialized = false;

  private get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /** À appeler une seule fois, au démarrage de l'app (AppComponent.ngOnInit). */
  init(): void {
    if (!this.isNative || this.initialized) return;

    OneSignal.Debug.setLogLevel(6); // à réduire/retirer en prod

    OneSignal.initialize(environment.ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);

    this.initialized = true;
  }

  /** Lie l'appareil à l'utilisateur connecté (external_id). */
  login(externalId: string): void {
    if (!this.isNative) return;
    OneSignal.login(externalId);
  }

  /** Dissocie l'appareil de l'utilisateur (à appeler au logout). */
  logout(): void {
    if (!this.isNative) return;
    OneSignal.logout();
  }
}