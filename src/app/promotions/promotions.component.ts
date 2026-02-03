import { Component, OnInit } from '@angular/core';
import { 
  IonContent, IonHeader, IonToolbar, IonIcon, 
  IonButton, IonSpinner, IonText 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flame, eyeOutline, cartOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Catalogue } from '../services/catalogue';
@Component({
  selector: 'app-promotions',
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, 
    IonIcon, IonButton, IonSpinner, IonText
  ],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
})
export class PromotionsComponent  implements OnInit {

 promoProducts: CatalogProductResponse[] = [];
  isLoading = true;

  constructor(
    private catalogService: Catalogue,
    private router: Router
  ) {
    addIcons({ flame, eyeOutline, cartOutline });
  }

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    this.isLoading = true;
    // On demande les 20 premières promos
    this.catalogService.getPromotions({ page: 0, size: 20 }).subscribe({
      next: (res) => {
        this.promoProducts = res.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement promos', err);
        this.isLoading = false;
      }
    });
  }

  goToDetails(productId: string) {
    this.router.navigate(['/details', productId]);
  }

}