import { Injectable, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class Location2Service {
  latitude = signal<string>('0.0');
  longitude = signal<string>('0.0');
  isLoading = signal<boolean>(false);

  async getCurrentLocation() {
    this.isLoading.set(true);

    // --- STRATEGY FOR WEB ---
    if (Capacitor.getPlatform() === 'web') {
      console.log('Using Browser Geolocation API...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude.set(pos.coords.latitude.toString());
          this.longitude.set(pos.coords.longitude.toString());
          this.isLoading.set(false);
          console.log('Web Location Success:', pos.coords);
        },
        (err) => {
          console.error('Web Location Error:', err.message);
          this.isLoading.set(false);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
      );
      return;
    }

    // --- STRATEGY FOR ANDROID/IOS ---
    try {
      // Vérifier les permissions
      let status = await Geolocation.checkPermissions();
      console.log('Permission status:', status);

      if (status.location !== 'granted') {
        status = await Geolocation.requestPermissions();
        console.log('Requested permissions:', status);
      }

      if (status.location === 'granted') {
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
        });

        this.latitude.set(coordinates.coords.latitude.toString());
        this.longitude.set(coordinates.coords.longitude.toString());
        console.log('Native Location Success:', coordinates.coords);
      } else {
        console.warn('Location permission not granted');
      }
    } catch (error) {
      console.error('Native Location Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  reset() {
    this.latitude.set('0.0');
    this.longitude.set('0.0');
  }
}
