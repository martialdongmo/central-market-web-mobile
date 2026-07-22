import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Preferences } from '@capacitor/preferences';
import { CartItem } from '../model/cartItem';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';

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
  // =========================
  addToCart(product: CatalogProductResponse) {

    const existing = this.items.find(
      i => i.productId === product.productId
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push(this.mapToCartItem(product));
    }

    this.updateStreams();
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
  // TOTAL PRICE
  // =========================
  getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      const price = item.promotionPrice ?? item.price;
      return total + price * item.quantity;
    }, 0);
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
  // MAPPER
  // =========================
  private mapToCartItem(product: CatalogProductResponse): CartItem {
    return {
      productId: product.productId,
      productName: product.productName,
      imageUrl: product.imageUrl,

      price: product.price,
      promotionPrice: product.promotionPrice ?? null,

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
  // SYNC ACCESS
  // =========================
  getItems(): CartItem[] {
    return [...this.items];
  }
}
