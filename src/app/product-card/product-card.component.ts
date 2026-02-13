import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { locationOutline, pricetagOutline, eyeOutline, cartOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Cart } from '../services/cart'; // Assure-toi que le chemin est correct
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // Ajout de NavController et ToastController

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: CatalogProductResponse;

  constructor(private cartService: Cart,private navCtrl: NavController,
    private toastCtrl: ToastController ) { 
    addIcons({ locationOutline, pricetagOutline, eyeOutline, cartOutline });
  }

  // Méthode pour ajouter au panier
  async addToCart(event: Event) {
    event.stopPropagation(); // Empêche l'ouverture de la page détails
    event.preventDefault();  // Sécurité supplémentaire pour le routerLink
    
    this.cartService.addToCart(this.product);
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