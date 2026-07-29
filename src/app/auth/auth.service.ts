import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, switchMap, tap } from 'rxjs/operators';

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

  private clientId = 'mobile';
  private webRedirectUri = environment.redirectUri;
  // Custom scheme for mobile OAuth callback
  private mobileRedirectUri = 'cm.kapexpert.grouping://callback';
  private scopes = 'openid USER_UPDATE USER_READ SHOP_READ PRODUCT_READ PRODUCT_UPDATE ORDER_WRITE ORDER_CREATE ORDER_READ PAYMENT_CREATE';

  private pkceService = inject(PkceService);
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  // ── Auth state stream ─────────────────────────────────────────────────────
  private readonly _currentUser$ = new BehaviorSubject<UserResponse | null>(null);
  readonly currentUser$ = this._currentUser$.asObservable();

  get currentUser(): UserResponse | null {
    return this._currentUser$.getValue();
  }

  // ── PKCE Login ────────────────────────────────────────────────────────────
  async login() {
    const verifier = this.pkceService.generateCodeVerifier();
    const challenge = await this.pkceService.generateCodeChallenge(verifier);
    sessionStorage.setItem('pkce_verifier', verifier);

    // Use custom scheme for mobile, web URL for web
    const isCapacitor = !!(window as any).Capacitor;
    const redirectUri = isCapacitor ? this.mobileRedirectUri : this.webRedirectUri;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: this.scopes,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${this.authEndpoint}?${params.toString()}`;

    // Use window.open for mobile (opens in system browser), window.location for web
    // On mobile, window.open with '_blank' opens the system browser
    // On web, window.location.href navigates within the same tab
    if (isCapacitor) {
      // Mobile platform - use window.open to open system browser
      // This keeps the app running in the background
      window.open(authUrl, '_blank');
    } else {
      // Web platform - use window.location
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
    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) throw new Error('PKCE verifier missing');

    // Use the same redirectUri that was used in the login
    const isCapacitor = !!(window as any).Capacitor;
    const redirectUri = isCapacitor ? this.mobileRedirectUri : this.webRedirectUri;

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('code', code)
      .set('redirect_uri', redirectUri)
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
      sessionStorage.removeItem('pkce_verifier');

      // FIX ✅ — peupler le stream immédiatement après le login
      this.me().subscribe();
    }

    return response;
  }

  // ── Boot loader ───────────────────────────────────────────────────────────
  /**
   * Appelé UNE SEULE FOIS depuis AppComponent.ngOnInit().
   * Lit le token Capacitor → appelle /me si valide → pousse dans currentUser$.
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
              Authorization: `Bearer ${token}`
            }),
            responseType: 'text'
          }
        ).pipe(

          catchError(error => {
            console.warn('Logout request failed', error);
            return of(null);
          })

        );

      })

    ).subscribe({

      next: async () => {

        await this.tokenService.clearTokens();

        this._currentUser$.next(null);

        window.location.href = '/secure-app';
      }

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