import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent,
  NavController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, bagOutline, cubeOutline, pricetagOutline,
  gridOutline, storefrontOutline, refreshOutline, shareOutline,
  copyOutline, checkmarkCircle, closeCircle,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

import { ProductCardComponent } from '../product-card/product-card.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

import { CatalogProductResponse } from '../../../core/model/response/catalogProductResponse';
import { CatalogService } from 'src/app/core/services/catalog.service';
import { CartService } from 'src/app/core/services/cart.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonIcon,
    IonInfiniteScroll, IonInfiniteScrollContent,
    ProductCardComponent, FooterComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  products: CatalogProductResponse[] = [];
  isLoading = false;
  isLoadingMore = false;
  cartCount = 0;

  inStockOnly = false;
  promotionOnly = false;

  /** Il n'existe pas d'endpoint "détails boutique" séparé — on déduit le
   *  nom et le statut ouvert/fermé du premier produit renvoyé par /shop/{id},
   *  qui porte déjà ces champs (shopName, shopOpen). */
  shopName: string | null = null;
  shopOpen: boolean | null = null;

  private shopId!: string;
  private page = 0;
  private totalPages = 1;
  private cartSub!: Subscription;

  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private navCtrl = inject(NavController);
  private location = inject(Location);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  readonly canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  constructor() {
    addIcons({
      arrowBackOutline, bagOutline, cubeOutline, pricetagOutline,
      gridOutline, storefrontOutline, refreshOutline, shareOutline,
      copyOutline, checkmarkCircle, closeCircle,
    });
  }

  ngOnInit(): void {
    this.shopId = this.route.snapshot.paramMap.get('shopId') ?? '';
    if (!this.shopId) {
      console.error('[ShopComponent] No shopId in route.');
      this.goBack();
      return;
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

  get shopInitial(): string {
    return this.shopName?.trim().charAt(0).toUpperCase() ?? '?';
  }

  loadProducts(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.catalogService.getByShop(this.shopId, this.inStockOnly, this.promotionOnly, this.page, PAGE_SIZE)
      .subscribe({
        next: page => {
          this.products = page.content;
          this.totalPages = page.totalPages;
          this.isLoading = false;

          const first = page.content[0];
          if (first) {
            this.shopName = first.shopName;
            this.shopOpen = first.shopOpen;
          }

          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to load shop products', err);
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

    this.catalogService.getByShop(this.shopId, this.inStockOnly, this.promotionOnly, this.page, PAGE_SIZE)
      .subscribe({
        next: page => {
          this.products = [...this.products, ...page.content];
          this.totalPages = page.totalPages;
          this.isLoadingMore = false;
          event.target.complete();
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('Failed to load more shop products', err);
          this.isLoadingMore = false;
          event.target.complete();
          this.cdr.markForCheck();
        },
      });
  }

  toggleInStockOnly(): void {
    this.inStockOnly = !this.inStockOnly;
    this.resetPaginationAndReload();
  }

  togglePromotionOnly(): void {
    this.promotionOnly = !this.promotionOnly;
    this.resetPaginationAndReload();
  }

  resetFilters(): void {
    this.inStockOnly = false;
    this.promotionOnly = false;
    this.resetPaginationAndReload();
  }

  private resetPaginationAndReload(): void {
    this.page = 0;
    this.totalPages = 1;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.loadProducts();
  }

  // ============================================================
  // PARTAGE — même chaîne de repli que sur la fiche produit :
  // app native (Capacitor) → Web Share API → presse-papier
  // ============================================================
  async share(): Promise<void> {
    if (!this.shopId) return;

    const url = `${window.location.origin}/shop/${this.shopId}`;
    const title = this.shopName ?? 'Boutique GroupinG';
    const text = this.shopName
      ? `Découvrez la boutique ${this.shopName} sur GroupinG`
      : 'Découvrez cette boutique sur GroupinG';

    // 1) App native (Capacitor) — ne se déclenche que si @capacitor/share
    //    est installé ET que l'app tourne réellement en natif (APK/iOS).
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title, text, url, dialogTitle: 'Partager cette boutique' });
        return;
      }
    } catch {
      // @capacitor/core ou @capacitor/share absent / pas natif — on continue
    }

    // 2) Web Share API (navigateurs mobiles, PWA)
    if (this.canNativeShare) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
      }
    }

    // 3) Repli presse-papier (navigateurs desktop)
    try {
      await navigator.clipboard.writeText(url);
      this.showToast('Lien de la boutique copié !', 'copy-outline', 'primary');
    } catch {
      this.showToast('Impossible de copier le lien.', 'close-circle', 'danger');
    }
  }

  private async showToast(
    message: string,
    icon: string,
    color: 'success' | 'primary' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      mode: 'ios',
      color,
      icon,
      cssClass: 'cart-toast',
    });
    await toast.present();
  }

  goBack(): void {
    this.location.back();
  }

  goToCart(): void {
    this.navCtrl.navigateForward('/cart');
  }

  trackById(_: number, p: CatalogProductResponse) { return p.productId; }
} 