import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { trashOutline, arrowForwardOutline, cartOutline } from 'ionicons/icons';
import { CartService } from '../services/cart.service';
import { CartItem } from '../model/cartItem';
import { Router } from '@angular/router';

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

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private router = inject(Router);

  constructor() {
    addIcons({ trashOutline, arrowForwardOutline, cartOutline });
  }

  ngOnInit() {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // =========================
  // UI ACTIONS
  // =========================

  goToCatalog() {
    this.navCtrl.navigateRoot('/catalog');
  }

  removeItem(id: string) {
    this.cartService.removeItem(id);
  }

  addQty(item: CartItem) {
    // reuse product-like structure from cart item
    this.cartService.addToCart(item as any);
  }

  removeQty(id: string) {
    this.cartService.decreaseQuantity(id);
  }

  checkout() {
    // TODO: implement order flow
    this.router.navigate(['/checkout']);
  }
}
