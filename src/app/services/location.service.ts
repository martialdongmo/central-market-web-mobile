import { Injectable, signal } from '@angular/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  latitude = signal<string>('0.0');
  longitude = signal<string>('0.0');
  isLoading = signal<boolean>(false);

  async getCurrentLocation() {
    this.isLoading.set(true);

    // --- STRATEGY FOR WEB TEST ---
    if (Capacitor.getPlatform() === 'web') {
      console.log('Using Browser Geolocation API...');
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude.set(pos.coords.latitude.toString());
          this.longitude.set(pos.coords.longitude.toString());
          this.isLoading.set(false);
          console.log('Web Location Success:', pos.coords.latitude);
        },
        (err) => {
          console.error('Web Location Error:', err.message);
          this.isLoading.set(false);
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
      );
      return; // Stop here, don't execute native code
    }

    // --- STRATEGY FOR ANDROID/IOS ---
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000
      });

      this.latitude.set(coordinates.coords.latitude.toString());
      this.longitude.set(coordinates.coords.longitude.toString());
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
