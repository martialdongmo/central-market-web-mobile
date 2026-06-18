import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, bagHandleOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent {
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({ alertCircleOutline, bagHandleOutline, arrowBackOutline });
  }

  goToCatalog() {
    this.navCtrl.navigateRoot('/catalog');
  }

  goBack() {
    this.navCtrl.back();
  }
}