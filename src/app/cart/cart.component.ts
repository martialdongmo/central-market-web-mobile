import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { Cart, CartItem } from '../services/cart';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { trashOutline, arrowForwardOutline, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  private sub!: Subscription;

  constructor(
    private cartService: Cart,
    private authService: AuthService,
    private navCtrl: NavController,
  ) {
    addIcons({ trashOutline, arrowForwardOutline, cartOutline });
  }

  ngOnInit() {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  goToCatalog() { this.navCtrl.navigateRoot('/catalog'); }
  removeItem(id: string) { this.cartService.removeItem(id); }
  addQty(p: any) { this.cartService.addToCart(p); }
  removeQty(id: string) { this.cartService.decreaseQuantity(id); }

  checkout() {
    if (!this.authService.isLoggedIn) {
      // Redirige vers login avec retour au checkout après
      this.navCtrl.navigateForward('/login', { queryParams: { redirect: 'checkout' } });
    } else {
      this.navCtrl.navigateForward('/checkout');
    }
  }
}
