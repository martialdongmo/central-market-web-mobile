import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { IonContent, IonIcon, IonModal, IonToggle, IonRange, NavController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  searchOutline, bagOutline, bagHandle, optionsOutline, closeCircle,
  gridOutline, tvOutline, gameControllerOutline, headsetOutline, heartOutline,
  homeOutline, refreshOutline, close, pricetagOutline, walletOutline, arrowBackOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  cubeOutline,
  flash,
  funnelOutline,
  listOutline,
  removeCircleOutline,
  rocketOutline,
  searchCircleOutline,
  shieldCheckmarkOutline,
  storefrontOutline
} from 'ionicons/icons';
import { CatalogQueryParams } from '../model/utils/catalog-query-params.model';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryResponse } from '../model/response/categoryResponse';
import { CategoryService } from '../services/category.service';
import { CatalogService } from '../services/catalog.service';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';
import { CartService } from '../services/cart.service';
import { LocationService } from '../services/location.service';
import { AuthService } from '../auth/auth.service';

const DEFAULT_MAX_PRICE = 10000;

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, IonContent, IonIcon, IonModal, IonToggle, IonRange, IonInfiniteScroll, IonInfiniteScrollContent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent implements OnInit, OnDestroy {
  // ─── view refs ────────────────────────────────────────────────────────────
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('overlayInput') overlayInput!: ElementRef<HTMLInputElement>;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  // ─── state ────────────────────────────────────────────────────────────────
  categories: CategoryResponse[] = [];
  products: CatalogProductResponse[] = [];
  cartCount = 0;
  isLoading = false;
  isLoadingMore = false;            // separate flag for infinite scroll
  isFilterModalOpen = false;
  searchOverlayOpen = false;
  activeCategory = 'all';

  // pagination metadata from last response
  private totalPages = 1;

  queryParams: CatalogQueryParams = {
    page: 0, size: 20,
    minPrice: 0, maxPrice: DEFAULT_MAX_PRICE,
    keyword: '', promotionOnly: false, inStockOnly: false,
  };

  // ─── deps ─────────────────────────────────────────────────────────────────
  private catalogService = inject(CatalogService);         // ← real service
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);

  private cartSub!: Subscription;
  private searchSub!: Subscription;
  private searchSubject = new Subject<string>();
  private locationService = inject(LocationService);
  private authService=inject(AuthService);

  constructor() {
    addIcons({
      searchOutline, bagOutline, bagHandle, optionsOutline, closeCircle,
      gridOutline, tvOutline, gameControllerOutline, headsetOutline, heartOutline,
      homeOutline, refreshOutline, close, pricetagOutline, walletOutline, arrowBackOutline,
    
      // new
      flash, shieldCheckmarkOutline, rocketOutline, storefrontOutline,
      searchCircleOutline, listOutline, funnelOutline,
      cubeOutline, removeCircleOutline, addCircleOutline, checkmarkCircleOutline,
    });
  }

  // ─── lifecycle ────────────────────────────────────────────────────────────

  ngOnInit() {
    // this.loadUser();
    this.locationService.getCurrentLocation();  // get user location for nearby sorting
    this.loadProducts();
    this.loadCategories();

    this.cartSub = this.cartService.cartCount$
      .subscribe(c => { this.cartCount = c; this.cdr.markForCheck(); });

    this.searchSub = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(kw => {
        this.queryParams.keyword = kw;
        this.resetPagination();
        this.loadProducts();
      });
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  // ─── data loading ─────────────────────────────────────────────────────────

  loadProducts() {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.catalogService.search(this.queryParams).subscribe({
      next: page => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Failed to load products', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /** Called by ion-infinite-scroll — appends next page */
  loadMore(event: any) {
    const nextPage = (this.queryParams.page ?? 0) + 1;
    if (nextPage >= this.totalPages) {
      event.target.complete();
      event.target.disabled = true;   // no more pages
      return;
    }

    this.queryParams.page = nextPage;
    this.isLoadingMore = true;

    this.catalogService.search(this.queryParams).subscribe({
      next: page => {
        this.products = [...this.products, ...page.content];  // append
        this.totalPages = page.totalPages;
        this.isLoadingMore = false;
        event.target.complete();
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Failed to load more products', err);
        this.isLoadingMore = false;
        event.target.complete();
        this.cdr.markForCheck();
      },
    });
  }

  loadCategories() {
    // todo:
  }

   loadUser() {
    this.authService.me().subscribe({
      next: (user) => {
        console.log(user)
       
      },
      error: (err) => console.error(err)
    });
  }

  // ─── search & filters ────────────────────────────────────────────────────

  onSearch(e: Event) {
    this.searchSubject.next((e.target as HTMLInputElement).value ?? '');
  }

  clearSearch() {
    this.queryParams.keyword = '';
    if (this.searchInput?.nativeElement) this.searchInput.nativeElement.value = '';
    this.searchSubject.next('');
  }

  selectCategory(id: string) {
    this.activeCategory = id;
    this.queryParams.categoryId = id === 'all' ? undefined : id;
    this.resetPagination();
    this.loadProducts();
  }

  openFilters() { this.isFilterModalOpen = true; }
  closeFilters() { this.isFilterModalOpen = false; }

  applyFilters() {
    this.resetPagination();
    this.isFilterModalOpen = false;
    this.loadProducts();
  }

  resetFilters() {
    this.queryParams = {
      page: 0, size: 20,
      minPrice: 0, maxPrice: DEFAULT_MAX_PRICE,
      keyword: '', promotionOnly: false, inStockOnly: false,
    };
    this.activeCategory = 'all';
    if (this.searchInput?.nativeElement) this.searchInput.nativeElement.value = '';
    this.isFilterModalOpen = false;
    this.resetPagination();
    this.loadProducts();
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  /** Reset to page 0 and re-enable infinite scroll */
  private resetPagination() {
    this.queryParams.page = 0;
    this.totalPages = 1;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.queryParams.keyword ||
      this.queryParams.promotionOnly ||
      this.queryParams.inStockOnly ||
      (this.queryParams.maxPrice ?? DEFAULT_MAX_PRICE) < DEFAULT_MAX_PRICE ||
      this.activeCategory !== 'all'
    );
  }
// in catalog.component.ts
onScroll(_e: CustomEvent) {}
  goToCart() { this.navCtrl.navigateForward('/cart'); }

  trackById(_: number, p: CatalogProductResponse) { return p.productId; }
}
