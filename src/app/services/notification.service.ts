import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastCtrl: ToastController) {}

  async showAddProductNotification(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1800,
      position: 'bottom',
      mode: 'ios',
      color: 'blue',
    });
    await toast.present();
  }
}