import { Injectable, inject } from '@angular/core';
import { PushNotifications, PushNotification, PushNotificationActionPerformed } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private readonly platform = inject(Platform);
  private readonly TOKEN_KEY = 'push_notification_token';

  private readonly permissionGrantedSubject = new BehaviorSubject<boolean>(false);
  readonly permissionGranted$ = this.permissionGrantedSubject.asObservable();

  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  readonly token$ = this.tokenSubject.asObservable();

  constructor() {
    this.initialize();
  }

  // =========================
  // INITIALIZE
  // =========================
  private async initialize() {
    // Attendre que la plateforme soit prête
    await this.platform.ready();

    // Enregistrer les écouteurs d'événements
    this.registerListeners();

    // Demander les permissions
    await this.requestPermissions();
  }

  // =========================
  // REGISTER LISTENERS
  // =========================
  private registerListeners() {
    // Écouteur pour le registre du token
    PushNotifications.addListener('registration', (token: any) => {
      console.log('[Push] Registration token:', token.value);
      this.tokenSubject.next(token.value);
      this.saveToken(token.value);
    });

    // Écouteur pour les erreurs de registre
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('[Push] Registration error:', error);
    });

    // Écouteur pour les notifications push reçues
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
      console.log('[Push] Push received:', notification);
      this.handlePushReceived(notification);
    });

    // Écouteur pour les notifications push cliquées
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
      console.log('[Push] Push action performed:', notification);
      this.handlePushActionPerformed(notification);
    });
  }

  // =========================
  // REQUEST PERMISSIONS
  // =========================
  async requestPermissions(): Promise<boolean> {
    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        console.log('[Push] Permission granted');
        this.permissionGrantedSubject.next(true);
        
        // Enregistrer pour les notifications push
        await PushNotifications.register();
        return true;
      } else {
        console.warn('[Push] Permission denied');
        this.permissionGrantedSubject.next(false);
        return false;
      }
    } catch (error) {
      console.error('[Push] Error requesting permissions:', error);
      this.permissionGrantedSubject.next(false);
      return false;
    }
  }

  // =========================
  // REGISTER FOR PUSH
  // =========================
  async register(): Promise<void> {
    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('[Push] Error registering:', error);
    }
  }

  // =========================
  // GET SAVED TOKEN (for use in app)
  // =========================
  async getSavedToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.TOKEN_KEY });
      return value;
    } catch (error) {
      console.error('[Push] Error getting saved token:', error);
      return null;
    }
  }

  // =========================
  // SAVE TOKEN
  // =========================
  private async saveToken(token: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.TOKEN_KEY,
        value: token,
      });
    } catch (error) {
      console.error('[Push] Error saving token:', error);
    }
  }

  // =========================
  // REMOVE TOKEN
  // =========================
  async removeToken(): Promise<void> {
    try {
      await Preferences.remove({ key: this.TOKEN_KEY });
      this.tokenSubject.next(null);
    } catch (error) {
      console.error('[Push] Error removing token:', error);
    }
  }

  // =========================
  // HANDLE PUSH RECEIVED
  // =========================
  private handlePushReceived(notification: PushNotification): void {
    // Ici, vous pouvez ajouter la logique pour afficher une notification locale
    // ou mettre à jour l'état de l'application
    console.log('[Push] Handling push received:', notification);
  }

  // =========================
  // HANDLE PUSH ACTION PERFORMED
  // =========================
  private handlePushActionPerformed(notification: PushNotificationActionPerformed): void {
    // Ici, vous pouvez naviguer vers une page spécifique en fonction de la notification
    console.log('[Push] Handling push action performed:', notification);
  }

  // =========================
  // GET DELIVERED NOTIFICATIONS
  // =========================
  async getDeliveredNotifications(): Promise<PushNotification[]> {
    try {
      const notifications = await PushNotifications.getDeliveredNotifications();
      return notifications.notifications;
    } catch (error) {
      console.error('[Push] Error getting delivered notifications:', error);
      return [];
    }
  }
}