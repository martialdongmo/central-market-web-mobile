import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Stripe } from '@capacitor-community/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment.development';
import OneSignal from 'onesignal-cordova-plugin';
import { OneSignalService } from './services/untils/one-signal.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private subs: Subscription[] = [];
  private readonly oneSignalService = inject(OneSignalService);


  async ngOnInit(): Promise<void> {
    await this.initStripe();
    this.initDeepLinkListener(); 
    this.oneSignalService.init();

    const sub = this.authService.loadCurrentUser().subscribe({
      next: user => {
        console.log('[App] Auth state changed:', user);
        console.log('[App] Auth:', user?.firstName ?? 'guest');
      },
      error: err => console.error('[App] Auth error:', err),
    });
    this.subs.push(sub);
  }

  // ── Pont entre l'événement OS "appUrlOpen" et le Router Angular ──────────
  private initDeepLinkListener(): void {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const url = event.url;

      // On ne traite que notre callback OAuth
      if (!url.startsWith('cm.kapexpert.grouping://callback')) {
        return;
      }

      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      const error = parsed.searchParams.get('error');

      if (code) {
        // Délègue tout le reste à CallbackComponent, comme sur le web
        this.router.navigate(['/callback'], {
          queryParams: { code },
          replaceUrl: true,
        });
      } else if (error) {
        console.error('[OAuth] Erreur reçue via deep link:', error);
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  private async initStripe(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      console.log('[Stripe] Initializing for native platform');
      await Stripe.initialize({ publishableKey: environment.stripePublishableKey });
      console.log('[Stripe]  Native initialized');
    } else {
      console.log('[Stripe] Initializing for web platform');
      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) {
        console.error('[Stripe] ❌ Web initialization failed');
        return;
      }
      console.log('[Stripe] Web initialized');
    }
  }


  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}