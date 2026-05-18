import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  
  private ACCESS_TOKEN_KEY = 'access_token';
  private REFRESH_TOKEN_KEY = 'refresh_token';
  private AUTH_ENDPOINT = environment.AUTH_API_URL;

  constructor() { }

  // Save tokens securely (Capacitor Preferences for mobile)
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Preferences.set({ key: this.ACCESS_TOKEN_KEY, value: accessToken });
    await Preferences.set({ key: this.REFRESH_TOKEN_KEY, value: refreshToken });
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.ACCESS_TOKEN_KEY });
    console.log("Retrieved access token:", value);  // 👈 DEBUG
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
    body.set('client_id', 'mobile');
    body.set('refresh_token', refreshToken);

    try {
      const response = await fetch(`${this.AUTH_ENDPOINT}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) return null;

      const data = await response.json();
      await this.setTokens(data.access_token, data.refresh_token ?? refreshToken);
      return data.access_token;

    } catch (error) {
      console.error('Refresh token failed', error);
      return null;
    }
  }
}
