import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private ACCESS_TOKEN_KEY = 'CENTRAL_MARKET_MOBILE_ACCESS_TOKEN';
  private REFRESH_TOKEN_KEY = 'CENTRAL_MARKET_MOBILE_REFRESH_TOKEN';
  private AUTH_ENDPOINT = environment.AUTH_API_URL;

  // Must match the client_id values used in AuthService
  private readonly CLIENT_ID_WEB = 'grouping_web';
  private readonly CLIENT_ID_MOBILE = 'mobile';

  constructor() {}

  private get clientId(): string {
    return Capacitor.isNativePlatform() ? this.CLIENT_ID_MOBILE : this.CLIENT_ID_WEB;
  }

  // Save tokens securely (Capacitor Preferences — works on web, Android, iOS)
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Preferences.set({ key: this.ACCESS_TOKEN_KEY, value: accessToken });
    await Preferences.set({ key: this.REFRESH_TOKEN_KEY, value: refreshToken });
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.ACCESS_TOKEN_KEY });
    return value;
  }

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.REFRESH_TOKEN_KEY });
    return value;
  }

  // Remove tokens (logout)
  async clearTokens(): Promise<void> {
    await Preferences.remove({ key: this.ACCESS_TOKEN_KEY });
    await Preferences.remove({ key: this.REFRESH_TOKEN_KEY });
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return null;

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('client_id', this.clientId);
    body.set('refresh_token', refreshToken);

    try {
      const response = await fetch(`${this.AUTH_ENDPOINT}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) {
        // Refresh token is invalid/expired — force a clean re-login
        // instead of leaving stale tokens around.
        if (response.status === 401 || response.status === 400) {
          await this.clearTokens();
        }
        return null;
      }

      const data = await response.json();
      await this.setTokens(data.access_token, data.refresh_token ?? refreshToken);
      return data.access_token;
    } catch (error) {
      console.error('Refresh token failed', error);
      return null;
    }
  }
}