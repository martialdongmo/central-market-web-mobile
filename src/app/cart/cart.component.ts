import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Cart, CartItem } from '../services/cart'; // Import de l'interface CartItem
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cartOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cart',
  standalone: true, // N'oublie pas standalone si tu n'utilises pas de modules
  imports: [IonicModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  private cartSub!: Subscription;

  constructor(
    private cartService: Cart, 
    private navCtrl: NavController,
    private router: Router
  ) {}

  ngOnInit() {
    // On s'abonne au flux des articles pour une mise à jour automatique
    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
    addIcons({ trashOutline, arrowForwardOutline, cartOutline });
  }

  ngOnDestroy() {
    if (this.cartSub) this.cartSub.unsubscribe();
  }

  goToCatalog() {
    this.navCtrl.navigateRoot('/catalog'); // navigateRoot est plus propre pour l'accueil
  }

  // Utilise removeItem car c'est le nom dans ton service
  removeItem(id: string) {
    this.cartService.removeItem(id);
  }

  // Optionnel : Ajouter/Diminuer quantité directement depuis le panier
  addQty(product: any) {
    this.cartService.addToCart(product);
  }

  removeQty(id: string) {
    this.cartService.decreaseQuantity(id);
  }

  checkout() {
    console.log("Commande validée pour :", this.totalPrice);
    // Simulation de succès
    this.cartService.clearCart();
    // Ici, tu pourrais naviguer vers une page 'success'
  }
}