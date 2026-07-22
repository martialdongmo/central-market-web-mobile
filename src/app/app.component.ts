import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})

export class AppComponent implements OnInit, OnDestroy {
 
  private readonly authService = inject(AuthService);
  private readonly pushNotificationService = inject(PushNotificationService);
  private subs: Subscription[] = [];
 
  ngOnInit(): void {
    // Boot unique — peuple currentUser$ pour tout l'app
    const sub = this.authService.loadCurrentUser().subscribe({
      next:  user => console.log('[App] Auth:', user?.firstName ?? 'guest'),
      error: err  => console.error('[App] Auth error:', err),
    });
    this.subs.push(sub);

    // Initialiser les notifications push
    this.initPushNotifications();
  }

  private async initPushNotifications(): Promise<void> {
    try {
      // Le service s'initialise automatiquement via le constructeur
      // On peut écouter le token pour l'envoyer au backend
      const tokenSub = this.pushNotificationService.token$.subscribe({
        next: (token) => {
          if (token) {
            console.log('[App] Push token received:', token);
            // TODO: Envoyer le token à votre backend pour l'enregistrement
          }
        },
        error: (err) => console.error('[App] Push token error:', err),
      });
      this.subs.push(tokenSub);
    } catch (error) {
      console.error('[App] Error initializing push notifications:', error);
    }
  }
 
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
 