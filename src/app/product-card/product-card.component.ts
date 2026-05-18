import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonIcon, NavController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cartOutline } from 'ionicons/icons';
import { Cart } from '../services/cart';
import { CustomCurrencyPipe } from "../services/custom-currency-pipe";
import { CatalogProductResponse } from '../model/response/catalogProductResponse';
import { CartService } from '../services/cart.service';

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
  // private cartService = inject(Cart);

  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);  

  
  constructor() {
    addIcons({ locationOutline, cartOutline });
  }




  async addToCart(e: Event) {
    e.stopPropagation(); e.preventDefault();


    this.cartService.addToCart(this.product);


    const t = await this.toastCtrl.create({ message:`${this.product.productName} ajouté !`, duration:1800, position:'bottom', mode:'ios', color:'dark' });
    await t.present();
  }
}
