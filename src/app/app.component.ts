import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { Stripe } from '@capacitor-community/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {

  private readonly authService = inject(AuthService);
  private subs: Subscription[] = [];

  async ngOnInit(): Promise<void> {

    await this.initStripe();

    const sub = this.authService.loadCurrentUser().subscribe({
      next:  user => console.log('[App] Auth:', user?.firstName ?? 'guest'),
      error: err  => console.error('[App] Auth error:', err),
    });

    this.subs.push(sub);
  }

  private async initStripe(): Promise<void> {

    if (Capacitor.isNativePlatform()) {

      // ✅ APK — iOS / Android
      console.log('[Stripe] Initializing for native platform');
      await Stripe.initialize({
        publishableKey: environment.stripePublishableKey
      });
      console.log('[Stripe] ✅ Native initialized');

    } else {

      // ✅ Web — Browser
      console.log('[Stripe] Initializing for web platform');
      const stripe = await loadStripe(environment.stripePublishableKey);

      if (!stripe) {
        console.error('[Stripe] ❌ Web initialization failed');
        return;
      }

      console.log('[Stripe] ✅ Web initialized');
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}