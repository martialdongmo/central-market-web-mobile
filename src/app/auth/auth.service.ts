
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
  private redirectUri = environment.redirectUri;
  private scopes = 'openid USER_UPDATE USER_READ SHOP_READ PRODUCT_READ PRODUCT_UPDATE ORDER_WRITE ORDER_CREATE ORDER_READ PAYMENT_CREATE';

  private pkceService = inject(PkceService);
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  /**
 * Holds the authenticated user in memory.
 * Components (AppComponent, ProfilePage…) subscribe to this instead of
 * calling me() directly — zero extra HTTP requests from the UI layer.
 *
 * Populated by:
 *   • loadCurrentUser()  — on app boot
 *   • me()               — every call automatically updates it via tap()
 *   • logout()           — resets to null
 */
  private readonly _currentUser$ = new BehaviorSubject<UserResponse | null>(null);

  /** Public read-only stream — subscribe from anywhere. */
  readonly currentUser$ = this._currentUser$.asObservable();


  async login() {
    // 1️ Generate PKCE verifier
    const verifier = this.pkceService.generateCodeVerifier();

    // 2️ Generate challenge
    const challenge = await this.pkceService.generateCodeChallenge(verifier);

    // 3️ Store verifier for later
    sessionStorage.setItem('pkce_verifier', verifier);

    // 4️ Build authorize URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${this.authEndpoint}?${params.toString()}`;

    // 5️ Redirect user
    window.location.href = authUrl;
  }







  async exchangeCodeForToken(code: string): Promise<any> {

    const verifier = sessionStorage.getItem('pkce_verifier');

    if (!verifier) {
      throw new Error('PKCE verifier missing');
    }

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('code_verifier', verifier);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const response = await this.http
      .post<any>(`${this.tokenEndpoint}`, body.toString(), { headers })
      .toPromise();

    if (response) {

      // store tokens temporarily
      this.tokenService.setTokens(response.access_token, response.refresh_token);

      console.log('Token exchange successful');

    }

    return response;
  }


  





  async isAuthenticated(): Promise<boolean> {
    const token = await this.tokenService.getAccessToken();
    return !!token;
  }


    public registerNewUser(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/api/v1/bis/auth/register`, request)
      .pipe(tap(console.log)
      );
  }
    me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.AUTH_URL}/me`).pipe(
      // NEW: push every successful /me response into the stream
      tap(user => this._currentUser$.next(user)),
      tap(console.log),
    );
  }




  /** Synchronous snapshot — useful in guards or one-off checks. */
  get currentUser(): UserResponse | null {
    return this._currentUser$.getValue();
  }

  /**
   * Call once from AppComponent.ngOnInit().
   *
   * Reads the access token from Capacitor Preferences (async).
   * • Token found  → calls me() which pushes the user into currentUser$.
   * • Token missing / expired → pushes null (user stays logged out silently).
   *
   * Does NOT break or change existing login / token-exchange flows.
   */
  loadCurrentUser(): Observable<UserResponse | null> {
    return from(this.tokenService.getAccessToken()).pipe(
      switchMap(token => {
        if (!token) return of(null);
        // Reuse the existing me() — it already does tap(console.log) etc.
        return this.me().pipe(
          catchError(() => {
            // Token invalid or expired — clear without crashing the app
            this.tokenService.clearTokens();
            this._currentUser$.next(null);
            return of(null);
          }),
        );
      }),
    );
  }





  verifyOtp(request: VerifyOtpRequest): Observable<string> {
    return this.http.post(
      `${this.API_URL}/api/v1/bis/auth/verify-otp`, request,
      { responseType: 'text' }
    );
  }




    logout() {
    this.tokenService.clearTokens();
    // NEW: clear the in-memory user so the UI reacts immediately
    this._currentUser$.next(null);
    window.location.href = '/secure-app';
  }




}
