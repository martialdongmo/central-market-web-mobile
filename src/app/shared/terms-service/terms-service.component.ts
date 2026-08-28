import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';
@Component({
  selector: 'app-terms-service',
  templateUrl: './terms-service.component.html',
  styleUrls: ['./terms-service.component.scss'],
imports: [CommonModule, IonContent, IonIcon],})
export class TermsServiceComponent  {
private navCtrl = inject(NavController);

  constructor() {
    addIcons({ shieldCheckmarkOutline });
  }

  dismiss() {
    this.navCtrl.back();
  }

}
