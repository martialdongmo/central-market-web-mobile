import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';

import { environment } from 'src/environments/environment.development';
import { PkceService } from './pkce.service';
import { TokenService } from './token.service';
import { UserResponse } from '../model/response/usersResponse';
import { RegisterRequest } from '../model/requests/registerRequest';
import { VerifyOtpRequest } from '../model/requests/verifyOtpRequest';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private authEndpoint = environment.AUTH_API_URL + '/oauth2/authorize';
  private tokenEndpoint = environment.AUTH_API_URL + '/oauth2/token';
  private AUTH_URL = environment.USER_API_URL;
  private API_URL = environment.AUTH_API_URL;

  private clientIdMobile = 'mobile';
  private clientIdWeb = 'grouping_web';

  private webRedirectUri = environment.redirectUri;
  private mobileRedirectUri = 'cm.kapexpert.grouping://callback';

  private scopes = 'openid USER_UPDATE USER_READ SHOP_READ PRODUCT_READ PRODUCT_UPDATE ORDER_WRITE ORDER_CREATE ORDER_READ PAYMENT_CREATE';

  private pkceService = inject(PkceService);
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private zone = inject(NgZone);

  private readonly PKCE_KEY = 'pkce_verifier';

  // ── Auth state stream ─────────────────────────────────────────────────────
  private readonly _currentUser$ = new BehaviorSubject<UserResponse | null>(null);
  readonly currentUser$ = this._currentUser$.asObservable();

  get currentUser(): UserResponse | null {
    return this._currentUser$.getValue();
  }

  // ── Platform helpers ──────────────────────────────────────────────────────
  private get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  private get clientId(): string {
    return this.isNative ? this.clientIdMobile : this.clientIdWeb;
  }

  private get redirectUri(): string {
    return this.isNative ? this.mobileRedirectUri : this.webRedirectUri;
  }

  constructor() {
    // Registers the deep-link listener once, app-wide. Call
    // authService.init() (or inject it once at bootstrap) so this runs early.
    if (this.isNative) {
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        this.handleNativeRedirect(event.url);
      });
    }
  }

  /** Extracts `code` from the custom-scheme redirect and completes the flow. */
  private handleNativeRedirect(url: string): void {
    if (!url.startsWith(this.mobileRedirectUri)) return;

    const parsed = new URL(url.replace(this.mobileRedirectUri, 'https://callback'));
    const code = parsed.searchParams.get('code');

    // Close the in-app browser now that we have control back
    Browser.close().catch(() => {});

    if (!code) return;

    this.zone.run(() => {
      this.exchangeCodeForToken(code).catch(err =>
        console.error('Native token exchange failed', err),
      );
    });
  }

  // ── PKCE Login ────────────────────────────────────────────────────────────
  async login(): Promise<void> {
    const verifier = this.pkceService.generateCodeVerifier();
    const challenge = await this.pkceService.generateCodeChallenge(verifier);
    await Preferences.set({ key: this.PKCE_KEY, value: verifier });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${this.authEndpoint}?${params.toString()}`;

    if (this.isNative) {
      // Opens system-managed in-app browser (SFSafariViewController / Custom Tabs).
      // appUrlOpen listener above catches the redirect back into the app.
      await Browser.open({ url: authUrl, presentationStyle: 'popover' });
    } else {
      window.location.href = authUrl;
    }
  }

  // ── Token exchange ────────────────────────────────────────────────────────
  /**
   * FIX: après avoir sauvegardé les tokens, on appelle me() pour peupler
   * le stream currentUser$ immédiatement. Sans ça, le footer reste en mode
   * guest même après un login réussi.
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    const stored = await Preferences.get({ key: this.PKCE_KEY });
    const verifier = stored.value;
    if (!verifier) throw new Error('PKCE verifier missing');

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('code_verifier', verifier);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const response = await this.http
      .post<any>(this.tokenEndpoint, body.toString(), { headers })
      .toPromise();

    if (response) {
      await this.tokenService.setTokens(
        response.access_token,
        response.refresh_token,
      );
      await Preferences.remove({ key: this.PKCE_KEY });

      this.me().subscribe();

      // On native, navigate into the app now that we're authenticated
      if (this.isNative) {
        this.router.navigateByUrl('/secure-app');
      }
    }

    return response;
  }

  // ── Boot loader ───────────────────────────────────────────────────────────
  /**
   * Appelé UNE SEULE FOIS depuis AppComponent.ngOnInit().
   * Lit le token → appelle /me si valide → pousse dans currentUser$.
   * Tous les abonnés (Footer, Profile…) réagissent automatiquement.
   */
  loadCurrentUser(): Observable<UserResponse | null> {
    return from(this.tokenService.getAccessToken()).pipe(
      switchMap(token => {
        if (!token) {
          this._currentUser$.next(null);
          return of(null);
        }
        return this.me().pipe(
          catchError(() => {
            this.tokenService.clearTokens();
            this._currentUser$.next(null);
            return of(null);
          }),
        );
      }),
    );
  }

  // ── User profile ──────────────────────────────────────────────────────────
  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.AUTH_URL}/me`).pipe(
      tap(user => this._currentUser$.next(user)),
    );
  }

  // ── Auth check ────────────────────────────────────────────────────────────
  async isAuthenticated(): Promise<boolean> {
    const token = await this.tokenService.getAccessToken();
    return !!token;
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    from(this.tokenService.getAccessToken()).pipe(
      switchMap(token => {
        if (!token) {
          return of(null);
        }

        return this.http.post(
          `${this.API_URL}/oauth2/logout`,
          {},
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${token}`,
            }),
            responseType: 'text',
          },
        ).pipe(
          catchError(error => {
            console.warn('Logout request failed', error);
            return of(null);
          }),
        );
      }),
    ).subscribe({
      next: async () => {
        await this.tokenService.clearTokens();
        this._currentUser$.next(null);

        if (this.isNative) {
          this.router.navigateByUrl('/secure-app');
        } else {
          window.location.href = '/secure-app';
        }
      },
    });
  }

  // ── Registration / OTP ────────────────────────────────────────────────────
  public registerNewUser(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.API_URL}/api/v1/bis/auth/register`,
      request,
    ).pipe(tap(console.log));
  }

  verifyOtp(request: VerifyOtpRequest): Observable<string> {
    return this.http.post(
      `${this.API_URL}/api/v1/bis/auth/verify-otp`,
      request,
      { responseType: 'text' },
    );
  }
}