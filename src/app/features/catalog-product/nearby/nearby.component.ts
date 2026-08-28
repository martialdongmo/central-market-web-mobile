import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonRange,
  IonInfiniteScroll, IonInfiniteScrollContent,
  IonHeader, IonToolbar, IonButtons, IonButton, IonBackButton, IonBadge, IonFooter,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline, refreshOutline, searchCircleOutline,
  navigateOutline, gridOutline, bagOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { ProductCardComponent } from '../product-card/product-card.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

import { CatalogProductResponse } from '../../../core/model/response/catalogProductResponse';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { LocationService } from 'src/app/core/services/location.service';
import { CartService } from 'src/app/core/services/cart.service';

const DEFAULT_RADIUS_KM = 10;
const PAGE_SIZE = 20;

@Component({
  selector: 'app-nearby',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonRange,
    IonInfiniteScroll, IonInfiniteScrollContent,
    IonHeader, IonToolbar, IonButtons, IonButton, IonBackButton, IonBadge, IonFooter,
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

  /** Nombre d'articles dans le panier, affiché en badge sur le bouton panier du header */
  cartCount = 0;

  private page = 0;
  private totalPages = 1;
  private cartSub!: Subscription;

  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ locationOutline, refreshOutline, searchCircleOutline, navigateOutline, gridOutline, bagOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.resolveLocationAndLoad();

    this.cartSub = this.cartService.cartCount$.subscribe(c => {
      this.cartCount = c;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  /** Demande la position puis charge les produits si elle a été obtenue.
   *  getCurrentLocation() gère elle-même web/Android/iOS et met à jour ses signals. */
  private async resolveLocationAndLoad(): Promise<void> {
    await this.locationService.getCurrentLocation();

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

  goToCart(): void {
    this.navCtrl.navigateForward('/cart');
  }

  async retry(): Promise<void> {
    this.locationService.reset();
    await this.resolveLocationAndLoad();
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