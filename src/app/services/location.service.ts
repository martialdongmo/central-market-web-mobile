import { Injectable, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  async getCurrentLocation(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    const platform = Capacitor.getPlatform();
    console.log('Platform detected:', platform);

    // ── WEB ──────────────────────────────────────────────────────
    if (platform === 'web') {
      return new Promise((resolve) => {

        if (!navigator.geolocation) {
          this.error.set('Geolocation non supportée par ce navigateur.');
          this.isLoading.set(false);
          resolve();
          return;
        }

        // HTTPS obligatoire — sur HTTP le navigateur bloque silencieusement
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          this.error.set('Geolocation requiert HTTPS.');
          this.isLoading.set(false);
          resolve();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Web coords:', pos.coords.latitude, pos.coords.longitude);
            this.latitude.set(pos.coords.latitude);
            this.longitude.set(pos.coords.longitude);
            this.isLoading.set(false);
            resolve();
          },
          (err) => {
            // err.code : 1=PERMISSION_DENIED 2=UNAVAILABLE 3=TIMEOUT
            const messages: Record<number, string> = {
              1: 'Permission de localisation refusée.',
              2: 'Position indisponible.',
              3: 'Timeout — réessayez.',
            };
            const msg = messages[err.code] ?? err.message;
            console.error('Web geolocation error:', err.code, msg);
            this.error.set(msg);
            this.isLoading.set(false);
            resolve();
          },
          {
            enableHighAccuracy: false,   // false = GPS off, réseau seulement → plus rapide
            timeout: 15000,
            maximumAge: 30000,
          }
        );
      });
    }

    // ── ANDROID / IOS ─────────────────────────────────────────────
    try {
      let status = await Geolocation.checkPermissions();
      console.log('Permission status:', status.location);

      if (status.location === 'denied') {
        // L'utilisateur a explicitement refusé — on ne peut plus demander
        this.error.set('Permission refusée. Activez la localisation dans les paramètres.');
        return;
      }

      if (status.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location !== 'granted') {
          this.error.set('Permission de localisation non accordée.');
          return;
        }
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      console.log('Native coords:', pos.coords.latitude, pos.coords.longitude);
      this.latitude.set(pos.coords.latitude);
      this.longitude.set(pos.coords.longitude);

    } catch (err: any) {
      console.error('Native geolocation error:', err);
      this.error.set(err?.message ?? 'Erreur de localisation.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── HELPERS ───────────────────────────────────────────────────
  hasLocation(): boolean {
    return this.latitude() !== null && this.longitude() !== null;
  }

  asNumbers(): { lat: number; lng: number } | null {
    const lat = this.latitude();
    const lng = this.longitude();
    if (lat === null || lng === null) return null;
    return { lat, lng };
  }

  asStrings(): { lat: string; lng: string } | null {
    const lat = this.latitude();
    const lng = this.longitude();

    if (lat === null || lng === null) {
      return null;
    }

    return {
      lat: lat.toString(),
      lng: lng.toString()
    };
  }

  reset(): void {
    this.latitude.set(null);
    this.longitude.set(null);
    this.error.set(null);
  }

  setLatitude(lat: number): void {
    this.latitude.set(lat);
  }

  setLongitude(lng: number): void {
    this.longitude.set(lng);
  }
}