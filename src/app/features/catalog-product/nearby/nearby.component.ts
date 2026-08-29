import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonRange,
  IonInfiniteScroll, IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, refreshOutline, searchCircleOutline,
  navigateOutline, gridOutline, bagOutline, arrowBackOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { ProductCardComponent } from '../product-card/product-card.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

import { CatalogProductResponse } from '../../../core/model/response/catalogProductResponse';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { LocationService } from 'src/app/core/services/location.service';
import { CartService } from 'src/app/core/services/cart.service';
import { NavController } from '@ionic/angular/standalone';

const DEFAULT_RADIUS_KM = 10;
const PAGE_SIZE = 20;

@Component({
  selector: 'app-nearby',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonRange,
    IonInfiniteScroll, IonInfiniteScrollContent,
    ProductCardComponent, FooterComponent,
  ],
  templateUrl: './nearby.component.html',
  styleUrls: ['./nearby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NearbyComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  /** Exposé au template pour lire directement les signals
   *  (isLoading(), error(), hasLocation()...) sans duplication d'état. */
  protected locationService = inject(LocationService);

  products: CatalogProductResponse[] = [];
  isLoadingProducts = false;
  isLoadingMore = false;
  radiusKm = DEFAULT_RADIUS_KM;
  cartCount = 0;

  private page = 0;
  private totalPages = 1;
  private cartSub!: Subscription;

  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({
      locationOutline, refreshOutline, searchCircleOutline,
      navigateOutline, gridOutline, bagOutline, arrowBackOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    
    this.locationService.getCurrentLocation();

    await this.resolveLocationAndLoad();

    this.cartSub = this.cartService.cartCount$.subscribe(c => {
      this.cartCount = c;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  /** Ne redemande la position que si elle n'est pas déjà connue —
   *  évite de re-déclencher le prompt GPS à chaque visite de la page. */
  private async resolveLocationAndLoad(): Promise<void> {
    if (!this.locationService.hasLocation()) {
      await this.locationService.getCurrentLocation();
    }

    if (this.locationService.hasLocation()) {
      this.resetPagination();
      this.loadProducts();
    } else {
      this.cdr.markForCheck();
    }
  }

  loadProducts(): void {
    const coords = this.locationService.asNumbers();
    if (!coords) return;

    this.isLoadingProducts = true;
    this.cdr.markForCheck();

    this.catalogService.getNearby(coords.lat, coords.lng, this.radiusKm, this.page, PAGE_SIZE)
      .subscribe({
        next: page => {
          this.products = page.content;
          this.totalPages = page.totalPages;
          this.isLoadingProducts = false;
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to load nearby products', err);
          this.isLoadingProducts = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadMore(event: any): void {
    const coords = this.locationService.asNumbers();
    if (!coords) {
      event.target.complete();
      return;
    }

    const nextPage = this.page + 1;
    if (nextPage >= this.totalPages) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    this.page = nextPage;
    this.isLoadingMore = true;

    this.catalogService.getNearby(coords.lat, coords.lng, this.radiusKm, this.page, PAGE_SIZE)
      .subscribe({
        next: page => {
          this.products = [...this.products, ...page.content];
          this.totalPages = page.totalPages;
          this.isLoadingMore = false;
          event.target.complete();
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to load more nearby products', err);
          this.isLoadingMore = false;
          event.target.complete();
          this.cdr.markForCheck();
        },
      });
  }

  onRadiusChange(): void {
    this.resetPagination();
    this.loadProducts();
  }

  async retry(): Promise<void> {
    this.locationService.reset();
    await this.resolveLocationAndLoad();
  }

  goBack(): void {
    this.location.back();
  }

  goToCart(): void {
    this.navCtrl.navigateForward('/cart');
  }

  private resetPagination(): void {
    this.page = 0;
    this.totalPages = 1;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  trackById(_: number, p: CatalogProductResponse) { return p.productId; }
}