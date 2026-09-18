import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Preferences } from '@capacitor/preferences';
import { CartItem } from '../model/cartItem';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';
import { Currency } from '../model/enums/currency-type';

export type AddToCartResult =
  | { status: 'added' }
  | { status: 'quantity-updated' }
  | { status: 'currency-mismatch'; cartCurrency: Currency; productCurrency: Currency };

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private readonly STORAGE_KEY = 'cart_items';

  private items: CartItem[] = [];

  private readonly cartCountSubject = new BehaviorSubject<number>(0);
  readonly cartCount$ = this.cartCountSubject.asObservable();

  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.init();
  }

  // =========================
  // INIT
  // =========================
  private async init() {
    await this.loadFromStorage();
    this.updateStreams();
  }

  // =========================
  // ADD TO CART
  // Un panier ne peut contenir que des produits d'une seule devise.
  // Si le panier est vide, la devise du produit devient la devise du panier.
  // Si le produit est d'une autre devise que le panier existant, on refuse
  // l'ajout et on renvoie 'currency-mismatch' pour que l'UI puisse informer
  // le client (ex : proposer de vider le panier).
  // =========================
  addToCart(product: CatalogProductResponse): AddToCartResult {

    const existing = this.items.find(
      i => i.productId === product.productId
    );

    if (existing) {
      existing.quantity += 1;
      this.updateStreams();
      return { status: 'quantity-updated' };
    }

    const cartCurrency = this.getCartCurrency();
    if (cartCurrency && cartCurrency !== product.currency) {
      return { status: 'currency-mismatch', cartCurrency, productCurrency: product.currency };
    }

    this.items.push(this.mapToCartItem(product));
    this.updateStreams();
    return { status: 'added' };
  }

  // =========================
  // DEVISE ACTUELLE DU PANIER
  // null si le panier est vide (aucune devise imposée).
  // =========================
  getCartCurrency(): Currency | null {
    return this.items.length ? this.items[0].currency : null;
  }

  // =========================
  // REMOVE ITEM
  // =========================
  removeItem(productId: string) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.updateStreams();
  }

  // =========================
  // DECREASE QUANTITY
  // =========================
  decreaseQuantity(productId: string) {
    const item = this.items.find(i => i.productId === productId);
    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.updateStreams();
    }
  }

  // =========================
  // CLEAR CART
  // =========================
  clearCart() {
    this.items = [];
    this.updateStreams();
  }

  // =========================
  // STREAM UPDATE
  // =========================
  private updateStreams() {
    const count = this.items.reduce((sum, i) => sum + i.quantity, 0);

    this.cartCountSubject.next(count);
    this.cartItemsSubject.next([...this.items]);

    this.saveToStorage();
  }

  // =========================
  // STORAGE
  // =========================
  private async saveToStorage() {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(this.items),
    });
  }

  private async loadFromStorage() {
    const data = await Preferences.get({ key: this.STORAGE_KEY });

    if (!data.value) return;

    try {
      this.items = JSON.parse(data.value) ?? [];
    } catch {
      this.items = [];
    }
  }

  // =========================
  // VALIDATION PROMO
  // Une promo n'est "réelle" que si active === true
  // ET promotionPrice est un nombre > 0.
  // Protège contre les données backend incohérentes
  // (ex: promotionActive: true, promotionPrice: 0).
  // =========================
  private hasRealPromo(promotionActive: boolean, promotionPrice: number | null | undefined): boolean {
    return promotionActive === true
      && promotionPrice != null
      && promotionPrice > 0;
  }

  // =========================
  // MAPPER
  // =========================
  private mapToCartItem(product: CatalogProductResponse): CartItem {
    const realPromo = this.hasRealPromo(product.promotionActive, product.promotionPrice);

    return {
      productId: product.productId,
      productName: product.productName,
      imageUrl: product.imageUrl,

      price: product.price,
      currency: product.currency,
      promotionPrice: realPromo ? product.promotionPrice : null,
      promotionActive: realPromo,

      shopId: product.shopId,
      userUuid: product.userUuid,
      shopName: product.shopName,
      shopEmail: product.shopEmail,
      shopLatitude: product.shopLatitude ?? 0,
      shopLongitude: product.shopLongitude ?? 0,

      quantity: 1,
    };
  }

  // =========================
  // PRIX UNITAIRE D'UN ITEM
  // =========================
  getItemPrice(item: CartItem): number {
    return this.hasRealPromo(item.promotionActive, item.promotionPrice)
      ? (item.promotionPrice as number)
      : item.price;
  }

  // =========================
  // TOTAL PRICE
  // Le panier n'ayant qu'une seule devise, ce total est toujours
  // exprimé dans la devise renvoyée par getCartCurrency().
  // =========================
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      return total + this.getItemPrice(item) * item.quantity;
    }, 0);
  }

  // =========================
  // SYNC ACCESS
  // =========================
  getItems(): CartItem[] {
    return [...this.items];
  }
}