import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonContent, IonIcon, IonModal, IonToggle, IonRange, NavController } from '@ionic/angular/standalone';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  searchOutline, bagOutline, bagHandle, optionsOutline, closeCircle,
  gridOutline, tvOutline, gameControllerOutline, headsetOutline, heartOutline,
  homeOutline, refreshOutline, close, pricetagOutline, walletOutline, arrowBackOutline
} from 'ionicons/icons';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { Catalogue } from '../services/catalogue';
import { Cart } from '../services/cart';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

const DEFAULT_MAX_PRICE = 10000;

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, IonContent, IonIcon, IonModal, IonToggle, IonRange],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('overlayInput') overlayInput!: ElementRef<HTMLInputElement>;

  cartCount = 0;
  products: CatalogProductResponse[] = [];
  isLoading = false;
  isFilterModalOpen = false;
  searchOverlayOpen = false;
  activeCategory = 'all';

  queryParams: CatalogQueryParams = {
    page: 0, size: 20, maxPrice: DEFAULT_MAX_PRICE,
    minPrice: 0, keyword: '', promotionOnly: false, inStockOnly: false,
  };

  categories = [
    { id: 'all',    label: 'Tout',   icon: 'grid-outline'            },
    { id: 'tech',   label: 'Tech',   icon: 'tv-outline'              },
    { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
    { id: 'audio',  label: 'Audio',  icon: 'headset-outline'         },
    { id: 'mode',   label: 'Mode',   icon: 'heart-outline'           },
    { id: 'maison', label: 'Maison', icon: 'home-outline'            },
  ];

  private cartSub!: Subscription;
  private searchSub!: Subscription;
  private searchSubject = new Subject<string>();

  constructor(
    private catalogService: Catalogue, private cartService: Cart,
    private navCtrl: NavController, private cdr: ChangeDetectorRef,
  ) {
    addIcons({ searchOutline, bagOutline, bagHandle, optionsOutline, closeCircle,
      gridOutline, tvOutline, gameControllerOutline, headsetOutline, heartOutline,
      homeOutline, refreshOutline, close, pricetagOutline, walletOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.loadProducts();
    this.cartSub = this.cartService.cartCount$.subscribe(c => { this.cartCount = c; this.cdr.markForCheck(); });
    this.searchSub = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(kw => { this.queryParams.keyword = kw; this.queryParams.page = 0; this.loadProducts(); });
  }

  ngOnDestroy() { this.cartSub?.unsubscribe(); this.searchSub?.unsubscribe(); }

  loadProducts() {
    this.isLoading = true; this.cdr.markForCheck();
    this.catalogService.search(this.queryParams).subscribe({
      next: r => { this.products = r.content; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  onScroll(_e: any) {}
  onSearch(e: Event) { this.searchSubject.next((e.target as HTMLInputElement).value ?? ''); }
  clearSearch() { this.queryParams.keyword = ''; if (this.searchInput?.nativeElement) this.searchInput.nativeElement.value = ''; this.searchSubject.next(''); }
  selectCategory(id: string) { this.activeCategory = id; this.queryParams.categoryId = id === 'all' ? undefined : id; this.queryParams.page = 0; this.loadProducts(); }
  openFilters() { this.isFilterModalOpen = true; }
  closeFilters() { this.isFilterModalOpen = false; }
  applyFilters() { this.queryParams.page = 0; this.isFilterModalOpen = false; this.loadProducts(); }
  resetFilters() {
    this.queryParams = { page:0, size:20, maxPrice:DEFAULT_MAX_PRICE, minPrice:0, keyword:'', promotionOnly:false, inStockOnly:false };
    this.activeCategory = 'all';
    if (this.searchInput?.nativeElement) this.searchInput.nativeElement.value = '';
    this.isFilterModalOpen = false; this.loadProducts();
  }
  get hasActiveFilters() { return !!(this.queryParams.keyword || this.queryParams.promotionOnly || (this.queryParams.maxPrice ?? DEFAULT_MAX_PRICE) < DEFAULT_MAX_PRICE || this.activeCategory !== 'all'); }
  goToCart() { this.navCtrl.navigateForward('/cart'); }
  trackById(_: number, p: CatalogProductResponse) { return p.productId; }
}
