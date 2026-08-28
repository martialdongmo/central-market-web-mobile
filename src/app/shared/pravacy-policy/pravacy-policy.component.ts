import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pravacy-policy',
  standalone: true,
  templateUrl: './pravacy-policy.component.html',
  styleUrls: ['./pravacy-policy.component.scss'],
  imports: [CommonModule, IonContent, IonIcon],
})
export class PravacyPolicyComponent {
private navCtrl = inject(NavController);

  constructor() {
    addIcons({ shieldCheckmarkOutline });
  }

  dismiss() {
    this.navCtrl.back();
  }

}
