import { Injectable } from '@angular/core';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { BehaviorSubject } from 'rxjs';
export interface CartItem extends CatalogProductResponse {
  quantity: number;
}
@Injectable({
  providedIn: 'root',
})

export class Cart {
// Liste interne des articles
  private items: CartItem[] = [];

  // BehaviorSubject pour le nombre TOTAL d'articles (badge)
  private cartCountSource = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSource.asObservable();

  // BehaviorSubject pour la liste complète des articles (utile pour la page panier)
  private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSource.asObservable();

  constructor() {}

  // AGROUTER UN PRODUIT
  addToCart(product: CatalogProductResponse) {
    // On cherche si le produit existe déjà dans le panier
    const existingItem = this.items.find(item => item.productId === product.productId);

    if (existingItem) {
      // Si oui, on augmente juste la quantité
      existingItem.quantity += 1;
    } else {
      // Si non, on l'ajoute avec une quantité initiale de 1
      this.items.push({ ...product, quantity: 1 });
    }

    this.updateStreams();
  }

  // SUPPRIMER UN PRODUIT COMPLETEMENT
  removeItem(productId: string) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.updateStreams();
  }

  // DIMINUER LA QUANTITÉ (Moins 1)
  decreaseQuantity(productId: string) {
    const item = this.items.find(i => i.productId === productId);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.updateStreams();
      }
    }
  }

  // CALCULER LE PRIX TOTAL
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      const price = item.promotionPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  }

  // VIDER LE PANIER
  clearCart() {
    this.items = [];
    this.updateStreams();
  }

  // MISE À JOUR DES FLUX (Streams)
  private updateStreams() {
    // Calcul du nombre total d'articles (somme des quantités)
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    this.cartCountSource.next(count);
    this.cartItemsSource.next([...this.items]); // On envoie une copie du tableau
    
    console.log('Panier mis à jour. Nombre total:', count);
  }

  // RÉCUPÉRER LES ARTICLES ACTUELS (Version synchrone)
  getItems() {
    return this.items;
  }
}
