import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  locationOutline, flashOutline, searchOutline, filterOutline,
  navigateOutline, storefrontOutline, cartOutline
} from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { CatalogService } from '../services/catalog.service';
import { CartService } from '../services/cart.service';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';

@Component({
  selector: 'app-nearby',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, TranslatePipe],
  templateUrl: './nearby.component.html',
  styleUrls: ['./nearby.component.scss']
})
export class NearbyComponent implements OnInit {

  private readonly catalogService = inject(CatalogService);
  private readonly cartService    = inject(CartService);
  private readonly router        = inject(Router);
  private readonly toastCtrl     = inject(ToastController);

  products: CatalogProductResponse[] = [];
  filteredProducts: CatalogProductResponse[] = [];
  searchQuery = '';
  isLoading = true;
  currentLocation = 'Dakar, SN';

  // Default to a generic location (will be overridden by geolocation)
  private lat = 14.7167;  // Dakar
  private lng = -17.4677;

  constructor() {
    addIcons({
      locationOutline, flashOutline, searchOutline, filterOutline,
      navigateOutline, storefrontOutline, cartOutline
    });
  }

  ngOnInit(): void {
    this.requestGeolocation();
    this.loadProducts();
  }

  private requestGeolocation(): void {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lat = pos.coords.latitude;
          this.lng = pos.coords.longitude;
          this.currentLocation = `${this.lat.toFixed(2)}, ${this.lng.toFixed(2)}`;
          this.loadProducts();
        },
        () => {
          this.currentLocation = 'Dakar, SN';
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      this.currentLocation = 'Dakar, SN';
    }
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.catalogService.getNearby(this.lat, this.lng, 10, 0, 30).subscribe({
      next: (response: any) => {
        this.products = response?.content || [];
        this.filterProducts();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load nearby products', err);
        this.isLoading = false;
        this.loadFallbackProducts();
      }
    });
  }

  private loadFallbackProducts(): void {
    this.catalogService.search({
      inStockOnly: false,
      promotionOnly: false,
      page: 0,
      size: 30,
      lat: this.lat,
      lng: this.lng,
      radiusKm: 50
    }).subscribe({
      next: (response: any) => {
        this.products = (response?.content || []).map((p: CatalogProductResponse) => ({
          ...p,
          distanceKm: (p.distanceKm !== undefined && p.distanceKm !== null) ? p.distanceKm : (Math.random() * 5 + 0.5)
        }));
        this.filterProducts();
      },
      error: (err: any) => {
        console.error('Failed to load products', err);
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  filterProducts(): void {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) {
      this.filteredProducts = this.products;
      return;
    }
    this.filteredProducts = this.products.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      (p.shopName || '').toLowerCase().includes(q) ||
      (p.categoryName || '').toLowerCase().includes(q)
    );
  }

  getPrice(product: CatalogProductResponse): number {
    return product.promotionActive && product.promotionPrice ? product.promotionPrice : product.price;
  }

  navigateToProduct(product: CatalogProductResponse): void {
    this.router.navigate(['/details-page', product.productId]);
  }

  async addToCart(product: CatalogProductResponse): Promise<void> {
    this.cartService.addToCart(product);

    const toast = await this.toastCtrl.create({
      message: `${product.productName} ajouté au panier`,
      duration: 1500,
      position: 'top',
      cssClass: 'cart-toast toast-color-dark',
    });
    await toast.present();
  }
}
