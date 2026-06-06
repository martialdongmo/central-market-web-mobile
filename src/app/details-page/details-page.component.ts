import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, heartOutline, heart, storefront, cartOutline } from 'ionicons/icons';
import { Cart } from '../services/cart';
import { MOCK_PRODUCTS } from '../services/mock-data';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';

@Component({ selector: 'app-details-page', standalone: true, imports: [CommonModule, IonContent, IonIcon], templateUrl: './details-page.component.html', styleUrls: ['./details-page.component.scss'] })
export class DetailsPageComponent implements OnInit {
  product?: CatalogProductResponse;
  isLoading = true;
  isFav = false;




  constructor(private route: ActivatedRoute, private cartService: Cart, private navCtrl: NavController, private toastCtrl: ToastController) {
    addIcons({ arrowBackOutline, heartOutline, heart, storefront, cartOutline });
  }

  
  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      const id = p.get('productId');

      if (id) {
        this.isLoading = true;
        setTimeout(() => {
          // this.product = MOCK_PRODUCTS.find(x => x.productId === id) ?? MOCK_PRODUCTS[0];
          this.isLoading = false;
        }, 350);
      }
    });

  }


  async addToCart() {
    if (!this.product) return;
    this.cartService.addToCart(this.product);
    const t = await this.toastCtrl.create({ message: `${this.product.productName} ajouté au panier !`, duration: 2000, position: 'bottom', mode: 'ios', color: 'dark', buttons: [{ text: 'VOIR', handler: () => this.navCtrl.navigateForward('/cart') }] });
    await t.present();
  }
  goBack() { this.navCtrl.back(); }
}
