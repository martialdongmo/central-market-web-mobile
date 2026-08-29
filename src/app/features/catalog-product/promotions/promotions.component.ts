import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  IonContent, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flame, giftOutline, chevronForward, refreshOutline, searchCircleOutline, bagOutline, arrowBackOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { ProductCardComponent } from '../product-card/product-card.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

import { CatalogProductResponse } from '../../../core/model/response/catalogProductResponse';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { LocationService } from 'src/app/core/services/location.service';
import { CartService } from 'src/app/core/services/cart.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonIcon,
    IonInfiniteScroll, IonInfiniteScrollContent,
    ProductCardComponent, FooterComponent,
  ],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  products: CatalogProductResponse[] = [];
  isLoading = false;
  isLoadingMore = false;
  cartCount = 0;

  private page = 0;
  private totalPages = 1;
  private cartSub!: Subscription;

  private catalogService = inject(CatalogService);
  private locationService = inject(LocationService);
  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    addIcons({ flame, giftOutline, chevronForward, refreshOutline, searchCircleOutline, bagOutline, arrowBackOutline });
  }

  ngOnInit(): void {
    // Non bloquant : les promos se chargent tout de suite ; si la position
    // était déjà connue (résolue ailleurs dans l'app), on l'utilise pour le tri.
    if (!this.locationService.hasLocation() && !this.locationService.isLoading()) {
      this.locationService.getCurrentLocation();
    }

    this.loadProducts();

    this.cartSub = this.cartService.cartCount$.subscribe(c => {
      this.cartCount = c;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const coords = this.locationService.asNumbers();

    this.catalogService.getPromotions(coords?.lat, coords?.lng, this.page, PAGE_SIZE)
      .subscribe({
        next: page => {
          this.products = page.content;
          this.totalPages = page.totalPages;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to load promotions', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadMore(event: any): void {
    const nextPage = this.page + 1;
    if (nextPage >= this.totalPages) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    this.page = nextPage;
    this.isLoadingMore = true;

    const coords = this.locationService.asNumbers();

    this.catalogService.getPromotions(coords?.lat, coords?.lng, this.page, PAGE_SIZE)
      .subscribe({
        next: page => {
          this.products = [...this.products, ...page.content];
          this.totalPages = page.totalPages;
          this.isLoadingMore = false;
          event.target.complete();
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to load more promotions', err);
          this.isLoadingMore = false;
          event.target.complete();
          this.cdr.markForCheck();
        },
      });
  }

  goBack(): void {
    this.location.back();
  }

  goToCart(): void {
    this.navCtrl.navigateForward('/cart');
  }

  trackById(_: number, p: CatalogProductResponse) { return p.productId; }
}