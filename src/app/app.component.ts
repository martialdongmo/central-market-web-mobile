import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonApp, IonRouterOutlet,
  IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  storefrontOutline, locationOutline, flameOutline,
  cartOutline, personCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonApp, IonRouterOutlet,
    IonTabBar, IonTabButton, IonIcon, IonLabel,
  ],
})
export class AppComponent {
  constructor() {
    addIcons({ storefrontOutline, locationOutline, flameOutline, cartOutline, personCircleOutline });
  }
}
