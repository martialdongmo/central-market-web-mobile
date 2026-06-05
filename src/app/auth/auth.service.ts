import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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


  async exchangeCodeForToken2(code: string) {

    const verifier = sessionStorage.getItem('pkce_verifier');

    if (!verifier) {
      throw new Error('PKCE verifier not found');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: verifier
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();

    // IMPORTANT
    await this.tokenService.setTokens(
      data.access_token,
      data.refresh_token
    );

    console.log('Token saved successfully');
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




  logout() {
    this.tokenService.clearTokens();
    // TODO: Call backend logout endpoint if needed
    window.location.href = '/secure-app';
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.tokenService.getAccessToken();
    return !!token;
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.AUTH_URL}/me`).pipe(
      tap(console.log)
    );
  }

  public registerNewUser(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/api/v1/bis/auth/register`, request)
      .pipe(tap(console.log)
      );
  }

  verifyOtp(request: VerifyOtpRequest): Observable<string> {
    return this.http.post(
      `${this.API_URL}/api/v1/bis/auth/verify-otp`,request,
      { responseType: 'text' }
    );
  }


}
