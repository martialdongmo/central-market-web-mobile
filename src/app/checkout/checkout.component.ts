import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmark, bagCheckOutline, checkmarkCircle } from 'ionicons/icons';
import { Cart, CartItem } from '../services/cart';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  isLoading = false;
  selectedAddress = 0;
  selectedPayment = 0;
  private sub!: Subscription;

  userName = '';
  userEmail = '';
  get userInitial(): string { return this.userName.charAt(0).toUpperCase(); }

  addresses = [
    { label: 'Domicile', address: 'Quartier Bastos, Rue des Ambassades', sub: 'Yaoundé, Cameroun', icon: 'home-outline' },
    { label: 'Bureau', address: 'Avenue Kennedy, Immeuble Central', sub: 'Yaoundé Centre, Cameroun', icon: 'business-outline' },
  ];

  paymentMethods = [
    { name: 'MTN Mobile Money', desc: 'Paiement instantané', emoji: '🟡' },
    { name: 'Orange Money', desc: 'Paiement sécurisé', emoji: '🟠' },
    { name: 'Carte Bancaire', desc: 'Visa / Mastercard', emoji: '💳' },
  ];

  constructor(
    public navCtrl: NavController,
    private cartService: Cart,
    private authService: AuthService,
    private orderService: OrderService,
  ) {
    addIcons({ arrowBackOutline, checkmark, bagCheckOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
    const user = this.authService.currentUser;
    if (user) { this.userName = user.name; this.userEmail = user.email; }
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  async confirmOrder() {
    this.isLoading = true;
    await new Promise(r => setTimeout(r, 1800));
    const addr = this.addresses[this.selectedAddress];
    const order = this.orderService.placeOrder(
      this.cartItems, this.totalPrice, `${addr.address}, ${addr.sub}`
    );
    this.cartService.clearCart();
    this.isLoading = false;
    this.navCtrl.navigateRoot(`/order-tracking/${order.id}`, { animated: true });
  }
}
