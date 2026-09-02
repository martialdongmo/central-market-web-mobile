import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from "@ionic/angular/standalone";
import { AuthService } from '../auth.service';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  lockClosedOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  imports: [IonContent, IonIcon],
})
export class CallbackComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      lockClosedOutline,
      shieldCheckmarkOutline
    })
  }

  async ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const oauthError = params.get('error');

    if (oauthError) {
      console.error('[CallbackComponent] OAuth2 error:', oauthError, params.get('error_description'));
      this.router.navigate(['/secure-app'], { replaceUrl: true });
      return;
    }

    if (!code) {
      console.warn('[CallbackComponent] No code and no error in callback URL — redirecting to login.');
      this.router.navigate(['/secure-app'], { replaceUrl: true });
      return;
    }

    try {
      await this.authService.exchangeCodeForToken(code);
      this.router.navigate(['/catalog'], { replaceUrl: true });
    } catch (err) {
      console.error('[CallbackComponent] Token exchange failed:', err);
      this.router.navigate(['/secure-app'], { replaceUrl: true });
    }
  }
}