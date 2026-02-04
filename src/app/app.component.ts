import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Important pour les directives de base
import { 
  IonApp, 
  IonRouterOutlet, 
  IonFooter, 
  IonToolbar, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, storefrontOutline, locationOutline, flameOutline, personCircleOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    IonApp, 
    IonRouterOutlet, 
    IonFooter, 
    IonToolbar, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel,
    RouterModule
  ],
})
export class AppComponent {
  constructor(private router: Router) {
    // On enregistre les icônes sinon elles n'apparaissent pas
    addIcons({
      'home-outline': homeOutline,
      'storefront-outline': storefrontOutline,
      'location-outline': locationOutline,
      'flame-outline': flameOutline,
      'person-outline': personOutline,
      'person-circle-outline': personCircleOutline
    });
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}