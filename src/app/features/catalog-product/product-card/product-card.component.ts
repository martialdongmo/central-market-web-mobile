import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cartOutline, checkmarkCircle } from 'ionicons/icons';
import { CatalogProductResponse } from '../../../core/model/response/catalogProductResponse';
import { CartService } from 'src/app/core/services/cart.service';
import { CustomCurrencyPipe } from 'src/app/core/services/custom.currency.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon, CustomCurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {

  @Input() product!: CatalogProductResponse;

  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ locationOutline, cartOutline, checkmarkCircle });
  }

  async addToCart(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    this.cartService.addToCart(this.product);

    const t = await this.toastCtrl.create({
      message: `${this.product.productName} ajouté au panier`,
      duration: 1800,
      position: 'top',          // reste visible, jamais masqué par un footer/tab-bar
      mode: 'ios',
      color: 'dark',            // couleur Ionic valide (existe réellement), proche de votre navy
      icon: 'checkmark-circle',
      cssClass: 'cart-toast',   // hook pour un style custom global (voir plus bas)
    });
    await t.present();
  }
}