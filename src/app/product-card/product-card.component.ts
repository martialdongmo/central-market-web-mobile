import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cartOutline } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Cart } from '../services/cart';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonIcon],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: CatalogProductResponse;
  constructor(private cartService: Cart, private navCtrl: NavController, private toastCtrl: ToastController) {
    addIcons({ locationOutline, cartOutline });
  }
  async addToCart(e: Event) {
    e.stopPropagation(); e.preventDefault();
    this.cartService.addToCart(this.product);
    const t = await this.toastCtrl.create({ message:`${this.product.productName} ajouté !`, duration:1800, position:'bottom', mode:'ios', color:'dark' });
    await t.present();
  }
}
