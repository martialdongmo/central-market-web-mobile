import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PkceService {


  generateCodeVerifier(length: number = 64): string {
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let verifier = '';

      for (let i = 0; i < length; i++) {
        verifier += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return verifier;
    }

    async generateCodeChallenge(verifier: string): Promise<string> {

      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);

      const digest = await crypto.subtle.digest('SHA-256', data);

      return this.base64UrlEncode(digest);
    }

    private base64UrlEncode(buffer: ArrayBuffer): string {
      return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
}
