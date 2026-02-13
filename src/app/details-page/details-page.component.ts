import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // Ajout de NavController et ToastController
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, cartOutline, heartOutline, 
  locationOutline, storefrontOutline, storefront 
} from 'ionicons/icons';

import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Catalogue } from '../services/catalogue';
import { Cart } from '../services/cart'; // Import du service Cart

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
  product?: CatalogProductResponse;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private catalogService: Catalogue,
    private cartService: Cart,        // Injection
    private navCtrl: NavController,   // Pour un goBack plus propre
    private toastCtrl: ToastController // Pour la confirmation
  ) {
    addIcons({ 
      arrowBackOutline, cartOutline, heartOutline, 
      locationOutline, storefrontOutline, storefront 
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idFromUrl = params.get('productId'); 
      if (idFromUrl) {
        this.loadProduct(idFromUrl);
      }
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.catalogService.getDetails(id).subscribe({
      next: (data) => {
        this.product = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Produit introuvable', err);
        this.isLoading = false;
      }
    });
  }

  // LOGIQUE D'AJOUT AU PANIER
  async addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      
      // Petit message de confirmation
      const toast = await this.toastCtrl.create({
        message: `${this.product.productName} ajouté au panier !`,
        duration: 2000,
        position: 'bottom',
        mode: 'ios',
        color: 'dark',
        buttons: [
          {
            text: 'VOIR',
            handler: () => {
              this.navCtrl.navigateForward('/cart');
            }
          }
        ]
      });
      await toast.present();
    }
  }

  goBack() {
    this.navCtrl.back(); // Plus fluide que window.history.back() sur mobile
  }
}