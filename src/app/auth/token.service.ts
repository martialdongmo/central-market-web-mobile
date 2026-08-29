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

  private readonly CLIENT_ID_WEB = 'grouping_web';
  private readonly CLIENT_ID_MOBILE = 'mobile';

  /** Verrou single-flight : évite que deux 401 simultanés déclenchent
   *  chacun leur propre refresh (le second, parti avec un refresh_token
   *  déjà consommé par le premier si rotation, se ferait rejeter et
   *  effacerait la session valide que le premier venait d'établir). */
  private refreshInFlight: Promise<string | null> | null = null;

  constructor() {}

  private get clientId(): string {
    return Capacitor.isNativePlatform() ? this.CLIENT_ID_MOBILE : this.CLIENT_ID_WEB;
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Preferences.set({ key: this.ACCESS_TOKEN_KEY, value: accessToken });
    await Preferences.set({ key: this.REFRESH_TOKEN_KEY, value: refreshToken });
  }

  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.ACCESS_TOKEN_KEY });
    return value;
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.REFRESH_TOKEN_KEY });
    return value;
  }

  async clearTokens(): Promise<void> {
    await Preferences.remove({ key: this.ACCESS_TOKEN_KEY });
    await Preferences.remove({ key: this.REFRESH_TOKEN_KEY });
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.performRefresh();

    try {
      return await this.refreshInFlight;
    } finally {
      this.refreshInFlight = null;
    }
  }

  private async performRefresh(): Promise<string | null> {
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