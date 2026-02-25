import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import {
  IonHeader, IonContent, IonIcon,
  IonButton, IonModal, IonToggle, IonRange, NavController
} from '@ionic/angular/standalone';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  cartOutline, optionsOutline, searchOutline,
  gridOutline, bagHandleOutline, pricetagOutline,
  bagHandle, leafOutline, tvOutline, heartOutline,
  closeCircle, refreshOutline, bagOutline, walletOutline, close
} from 'ionicons/icons';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { Catalogue } from '../services/catalogue';
import { Cart } from '../services/cart';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Category {
  id: string;
  label: string;
  icon: string;
  categoryId?: string;
}

const DEFAULT_MAX_PRICE = 10000;
const SCROLL_THRESHOLD = 60; // Pixel threshold to trigger compact header

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    IonHeader,
    IonContent,
    IonIcon,
    IonButton,
    IonModal,
    IonToggle,
    IonRange,
  ],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // ─── STATE ───
  cartCount         = 0;
  products: CatalogProductResponse[] = [];
  isLoading         = false;
  isHeaderCompact   = false;
  isFilterModalOpen = false;
  activeCategory    = 'all';

  // Toutes les valeurs ont un défaut concret — plus d'undefined
  queryParams: CatalogQueryParams = {
    page:          0,
    size:          20,
    maxPrice:      DEFAULT_MAX_PRICE,
    minPrice:      0,
    keyword:       '',
    promotionOnly: false,
    inStockOnly:   false,
  };

  // Valeur locale pour le range (number garanti, jamais undefined)
  maxPriceValue = DEFAULT_MAX_PRICE;

  // ─── CATEGORIES ───
  categories: Category[] = [
    { id: 'all',      label: 'Tout',     icon: 'grid-outline'       },
    { id: 'epicerie', label: 'Épicerie', icon: 'leaf-outline'       },
    { id: 'mode',     label: 'Mode',     icon: 'bag-handle-outline' },
    { id: 'electro',  label: 'Électro',  icon: 'tv-outline'         },
    { id: 'beaute',   label: 'Beauté',   icon: 'heart-outline'      },
  ];

  // ─── PRIVATE ───
  private cartSub!: Subscription;
  private searchSub!: Subscription;
  private searchSubject = new Subject<string>();
  private lastScrollTop = 0;
  private scrollTimeout: any = null;

  constructor(
    private catalogService: Catalogue,
    private cartService: Cart,
    private navCtrl: NavController,
  ) {
    addIcons({
      cartOutline, optionsOutline, searchOutline, gridOutline,
      bagHandleOutline, pricetagOutline, bagHandle,
      leafOutline, tvOutline, heartOutline,
      closeCircle, refreshOutline, bagOutline, walletOutline, close
    });
  }

  // ────────────────────────────────────────
  ngOnInit(): void {
    this.loadProducts();

    this.cartSub = this.cartService.cartCount$
      .subscribe(count => this.cartCount = count);

    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.queryParams.keyword = keyword;
      this.queryParams.page    = 0;
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  // ─── LOAD ───
  loadProducts(append = false): void {
    this.isLoading = !append;

    this.catalogService.search(this.queryParams).subscribe({
      next: (res) => {
        this.products = append
          ? [...this.products, ...res.content]
          : res.content;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // ─── SCROLL ─── (Optimized for smooth performance)
  onScroll(event: any): void {
    const scrollTop = event.detail.scrollTop;

    // Debounce scroll events to prevent excessive re-renders
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      // Only update if threshold is crossed to avoid constant updates
      const shouldBeCompact = scrollTop > SCROLL_THRESHOLD;
      if (this.isHeaderCompact !== shouldBeCompact) {
        this.isHeaderCompact = shouldBeCompact;
      }
    }, 16); // ~60fps throttle

    this.lastScrollTop = scrollTop;
  }

  // ─── SEARCH ─── (input natif - fix ion-searchbar web)
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.queryParams.keyword = '';
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
    this.searchSubject.next('');
    this.loadProducts();
  }

  focusSearch(): void {
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }

  // ─── PRICE RANGE ───
  onPriceChange(event: any): void {
    this.maxPriceValue = event.detail.value as number;
  }

  // ─── FILTERS ───
  openFilters(): void {
    // Sync la valeur locale à l'ouverture
    this.maxPriceValue = this.queryParams.maxPrice ?? DEFAULT_MAX_PRICE;
    this.isFilterModalOpen = true;
  }

  closeFilters(): void {
    this.isFilterModalOpen = false;
  }

  applyFilters(): void {
    this.queryParams.maxPrice = this.maxPriceValue;
    this.queryParams.page     = 0;
    this.isFilterModalOpen    = false;
    this.loadProducts();
  }

  resetFilters(): void {
    this.maxPriceValue = DEFAULT_MAX_PRICE;
    this.queryParams = {
      page:          0,
      size:          20,
      maxPrice:      DEFAULT_MAX_PRICE,
      minPrice:      0,
      keyword:       '',
      promotionOnly: false,
      inStockOnly:   false,
    };
    this.activeCategory = 'all';
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.value = '';
    }
    this.loadProducts();
  }

  // ─── CATEGORIES ───
  selectCategory(id: string): void {
    this.activeCategory         = id;
    const cat                   = this.categories.find(c => c.id === id);
    this.queryParams.categoryId = id === 'all' ? undefined : cat?.categoryId;
    this.queryParams.page       = 0;
    this.loadProducts();
  }

  // ─── COMPUTED ───
  get hasActiveFilters(): boolean {
    return !!(
      this.queryParams.keyword !== '' ||
      this.queryParams.promotionOnly ||
      this.queryParams.inStockOnly   ||
      (this.queryParams.maxPrice ?? DEFAULT_MAX_PRICE) < DEFAULT_MAX_PRICE ||
      this.activeCategory !== 'all'
    );
  }

  // ─── NAV ───
  goToCart(): void {
    this.navCtrl.navigateForward('/cart');
  }

  // ─── TRACKBY ───
  trackById(_: number, item: CatalogProductResponse): any {
    return item.productId;
  }
}
