import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { IonContent, IonIcon, IonModal, IonToggle, IonRange, IonSelect, IonSelectOption, NavController, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
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
  storefrontOutline,
  pricetagsOutline
} from 'ionicons/icons';
import { CatalogQueryParams } from '../model/utils/catalog-query-params.model';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryResponse } from '../model/response/categoryResponse';
import { CategoryService } from '../services/category.service';
import { ProductCategory, getProductCategoryLabel } from '../model/enums/product-category';
import { CatalogService } from '../services/catalog.service';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';
import { CartService } from '../services/cart.service';
import { LocationService } from '../services/location.service';
import { AuthService } from '../auth/auth.service';
import { FooterComponent } from "../shares/footer/footer.component";
import { CustomCurrencyPipe } from '../services/custom.currency.pipe';

/** Valeur "plafond" purement visuelle pour le slider du modal.
 *  Elle ne part JAMAIS dans la requête tant que l'utilisateur
 *  n'a pas explicitement réduit le budget. */
const SLIDER_MAX_PRICE = 30000;

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ProductCardComponent,
    IonContent, IonIcon, IonModal, IonToggle, IonRange, IonSelect, IonSelectOption,
    IonInfiniteScroll, IonInfiniteScrollContent, FooterComponent,
    CustomCurrencyPipe,
  ],
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
  isLoadingMore = false;
  isFilterModalOpen = false;
  searchOverlayOpen = false;
  activeCategory = 'all';

  /** Bornes purement visuelles pour le slider du modal (pas encore appliquées) */
  readonly sliderMaxPrice = SLIDER_MAX_PRICE;
  filterMaxPrice = SLIDER_MAX_PRICE;
  /** Sélection catégorie dans le modal (peut différer de activeCategory tant que non appliquée) */
  filterCategoryId = 'all';

  private totalPages = 1;

  // ⚠️ AUCUN maxPrice/minPrice/categoryId par défaut ici :
  // s'ils sont définis, ils sont TOUJOURS envoyés à l'API et filtrent le catalogue.
  queryParams: CatalogQueryParams = {
    page: 0, size: 20,
    keyword: '', promotionOnly: false, inStockOnly: false,
  };

  // ─── deps ─────────────────────────────────────────────────────────────────
  private catalogService = inject(CatalogService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private cdr = inject(ChangeDetectorRef);

  private cartSub!: Subscription;
  private searchSub!: Subscription;
  private searchSubject = new Subject<string>();
  private locationService = inject(LocationService);
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      searchOutline, bagOutline, bagHandle, optionsOutline, closeCircle,
      gridOutline, tvOutline, gameControllerOutline, headsetOutline, heartOutline,
      homeOutline, refreshOutline, close, pricetagOutline, walletOutline, arrowBackOutline,
      flash, shieldCheckmarkOutline, rocketOutline, storefrontOutline,
      searchCircleOutline, listOutline, funnelOutline,
      cubeOutline, removeCircleOutline, addCircleOutline, checkmarkCircleOutline,
      pricetagsOutline,
    });
  }

  // ─── lifecycle ────────────────────────────────────────────────────────────

  ngOnInit() {
    this.locationService.getCurrentLocation();
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

  loadMore(event: any) {
    const nextPage = (this.queryParams.page ?? 0) + 1;
    if (nextPage >= this.totalPages) {
      event.target.complete();
      event.target.disabled = true;
      return;
    }

    this.queryParams.page = nextPage;
    this.isLoadingMore = true;

    this.catalogService.search(this.queryParams).subscribe({
      next: page => {
        this.products = [...this.products, ...page.content];
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

  /** Charge la liste réelle des catégories depuis le backend.
   *  ⚠️ Adaptez `getAll()` à la méthode exposée par votre CategoryService. */
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (cats: CategoryResponse[]) => {
        this.categories = cats;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Failed to load categories', err),
    });
  }

  loadUser() {
    this.authService.me().subscribe({
      next: (user) => console.log(user),
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

  /** Sélection rapide via les chips au-dessus de la liste */
  selectCategory(id: string) {
    this.activeCategory = id;
    this.filterCategoryId = id;
    this.queryParams.categoryId = id === 'all' ? undefined : id;
    this.resetPagination();
    this.loadProducts();
  }

  openFilters() {
    // synchronise l'état du modal avec les filtres actuellement appliqués
    this.filterMaxPrice = this.queryParams.maxPrice ?? this.sliderMaxPrice;
    this.filterCategoryId = this.activeCategory;
    this.isFilterModalOpen = true;
  }
  closeFilters() { this.isFilterModalOpen = false; }

  applyFilters() {
    // maxPrice n'est envoyé QUE si l'utilisateur a réellement réduit le curseur
    this.queryParams.maxPrice = this.filterMaxPrice < this.sliderMaxPrice
      ? this.filterMaxPrice
      : undefined;

    this.activeCategory = this.filterCategoryId;
    this.queryParams.categoryId = this.filterCategoryId === 'all'
      ? undefined
      : this.filterCategoryId;

    this.resetPagination();
    this.isFilterModalOpen = false;
    this.loadProducts();
  }

  resetFilters() {
    this.queryParams = {
      page: 0, size: 20,
      keyword: '', promotionOnly: false, inStockOnly: false,
    };
    this.filterMaxPrice = this.sliderMaxPrice;
    this.filterCategoryId = 'all';
    this.activeCategory = 'all';
    if (this.searchInput?.nativeElement) this.searchInput.nativeElement.value = '';
    this.isFilterModalOpen = false;
    this.resetPagination();
    this.loadProducts();
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

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
      this.queryParams.maxPrice != null ||
      this.activeCategory !== 'all'
    );
  }

  /** `CategoryResponse.name` stocke la valeur brute de l'enum (ex: "SKINCARE").
   *  On la traduit en libellé FR pour l'affichage (chips + select du modal). */
  categoryLabel(cat: CategoryResponse): string {
    return getProductCategoryLabel(cat.name as ProductCategory);
  }

  onScroll(_e: CustomEvent) {}
  goToCart() { this.navCtrl.navigateForward('/cart'); }
  trackById(_: number, p: CatalogProductResponse) { return p.productId; }

  onCreateShop() {
    window.open('https://kapexpert.cloud:3001/create-shop', '_system');
  }

  onBecomePartner() {
    window.open('https://kapexpert.cloud:3001/become-partner', '_system');
  }

  onShopNearMe() {
    console.log('Action pour géolocaliser les boutiques à proximité');
  }
}