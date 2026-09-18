import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class ShareService {

  private readonly toastCtrl = inject(ToastController);

  /**
   * Partage un lien avec titre et message d'accompagnement
   */
  async shareUrl(title: string, text: string, url: string): Promise<void> {
    // 1. Sur application mobile native (Capacitor iOS / Android)
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: 'Partager via',
        });
        return;
      } catch (err) {
        console.warn('Erreur ou annulation du partage natif:', err);
        return;
      }
    }

    // 2. Web Share API (Navigateurs Web Mobiles & PWA)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
      }
    }

    // 3. Fallback Presse-papier (Desktop)
    try {
      await navigator.clipboard.writeText(url);
      await this.showToast('Lien copié dans le presse-papier !', 'copy-outline', 'primary');
    } catch {
      await this.showToast('Impossible de copier le lien.', 'close-circle', 'danger');
    }
  }

  private async showToast(message: string, icon: string, color: 'primary' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      icon,
      cssClass: 'bis-toast',
    });
    await toast.present();
  }
}