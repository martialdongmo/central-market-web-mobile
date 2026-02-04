import { Component, OnInit } from '@angular/core';
import { 
  IonContent, IonHeader, IonToolbar, IonIcon, 
  IonButton, IonSpinner, IonBadge 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, navigateOutline, storefrontOutline, chevronForward } from 'ionicons/icons';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Catalogue } from '../services/catalogue';
@Component({
  selector: 'app-nearby',
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, 
    IonIcon, IonButton, IonSpinner, IonBadge
  ],
  templateUrl: './nearby.component.html',
  styleUrls: ['./nearby.component.scss'],
})
export class NearbyComponent  implements OnInit {

nearbyProducts: CatalogProductResponse[] = [];
  isLoading = true;

  constructor(
    private catalogService: Catalogue,
    private router: Router
  ) {
    addIcons({ locationOutline, navigateOutline, storefrontOutline, chevronForward });
  }

  ngOnInit() {
    this.loadNearby();
  }

  loadNearby() {
    this.isLoading = true;
    // On peut passer lat/lng ici si ton CatalogQueryParams le permet
    this.catalogService.getNearby({ page: 0, size: 20 }).subscribe({
      next: (res) => {
        this.nearbyProducts = res.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement proximité', err);
        this.isLoading = false;
      }
    });
  }

  viewProduct(productId: string) {
    this.router.navigate(['/details', productId]);
  }

  goToDetails(productId: string) {
    this.router.navigate(['/details', productId]);
  }
}