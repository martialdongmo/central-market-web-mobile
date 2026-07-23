import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Stripe } from '@capacitor-community/stripe';
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
 
  ngOnInit(): void {
     Stripe.initialize({
      publishableKey: environment.stripePublishableKey // clé PUBLIQUE Stripe, pas la secrète
    });
    // Boot unique — peuple currentUser$ pour tout l'app
    const sub = this.authService.loadCurrentUser().subscribe({
      next:  user => console.log('[App] Auth:', user?.firstName ?? 'guest'),
      error: err  => console.error('[App] Auth error:', err),
    });
    this.subs.push(sub);
  }
 
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
 