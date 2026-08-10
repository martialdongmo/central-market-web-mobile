import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { IonContent, IonIcon, IonModal, IonToggle, IonRange, NavController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
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
  storefrontOutline,
  cartOutline,
  bicycleOutline,
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
import { FooterComponent } from "../shares/footer/footer.component";
import { LanguageSwitcherComponent } from '../i18n/language-switcher.component';

const DEFAULT_MAX_PRICE = 10000;

interface HeroMessage {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, IonContent, IonIcon, IonModal, IonToggle, IonRange, IonInfiniteScroll, IonInfiniteScrollContent, FooterComponent, LanguageSwitcherComponent],
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

  // ─── rotating hero banner (blue card) ──────────────────────────────────────
  readonly heroMessages: HeroMessage[] = [
    { icon: 'cart-outline', text: 'Vous pouvez acheter en quelques clics' },
    { icon: 'bicycle-outline', text: 'Devenez livreur et gagnez de l\'argent' },
    { icon: 'storefront-outline', text: 'Devenez partenaire en vendant vos produits' },
  ];
  heroMessageIndex = 0;
  private heroInterval?: ReturnType<typeof setInterval>;

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
      cartOutline, bicycleOutline,
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

    // rotate the 3 promo messages in the blue hero card
    this.heroInterval = setInterval(() => {
      this.heroMessageIndex = (this.heroMessageIndex + 1) % this.heroMessages.length;
      this.cdr.markForCheck();
    }, 3500);
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
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

  /**
   * ⚠️ Adjust `.getAll()` below to match the real method name on your
   * CategoryService (e.g. `findAll()`, `search()`...). This was previously
   * a `// todo:` stub, which is why the category chips row was always empty
   * and "All" never appeared.
   */
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: CategoryResponse[]) => {
        const allChip = { id: 'all', name: 'All' } as CategoryResponse;
        this.categories = [allChip, ...categories];
        this.cdr.markForCheck();
      },
      error: (err: unknown) => console.error('Failed to load categories', err),
    });
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

  // Explicit handlers replace the old [(ngModel)] bindings below — with
  // ion-toggle/ion-range inside an OnPush component + ion-modal's portal,
  // ngModel updates were not reliably reaching `queryParams`, so "Apply"
  // kept firing with stale values. [checked]/[value] + (ionChange) +
  // markForCheck() is the robust pattern for Ionic form controls here.
  onTogglePromotion(checked: boolean) {
    this.queryParams.promotionOnly = checked;
    this.cdr.markForCheck();
  }

  onToggleInStock(checked: boolean) {
    this.queryParams.inStockOnly = checked;
    this.cdr.markForCheck();
  }

  onMaxPriceChange(value: number | { lower: number; upper: number }) {
    // ion-range's detail.value is typed as RangeValue (number | {lower, upper}),
    // even without dualKnobs — narrow it to a plain number here.
    this.queryParams.maxPrice = typeof value === 'number' ? value : value.upper;
    this.cdr.markForCheck();
  }

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


  onCreateShop() {
  // L'URL de production cloud fournie pour la création de boutique
  const cloudUrl = 'https://kapexpert.cloud:3001/create-shop';
  
  // Utilise le navigateur système par défaut sur Android / iOS
  window.open(cloudUrl, '_system');
}

onBecomePartner() {
  window.open('https://kapexpert.cloud:3001/become-partner', '_system');
}

onShopNearMe() {
  console.log('Action pour géolocaliser les boutiques à proximité');
}
}