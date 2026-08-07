import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent, IonIcon, ToastController, IonTitle, IonHeader, IonFooter, IonButtons, IonToolbar, IonButton, IonSkeletonText } from '@ionic/angular/standalone';
import { arrowBackOutline, heartOutline, heart, cartOutline, bagCheckOutline, checkmarkCircle, chevronForwardOutline, closeCircle, copyOutline, locationOutline, logoWhatsapp, pricetagOutline, shareOutline, starOutline, imagesOutline, checkmarkOutline } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';
import { CatalogProductVariantResponse } from '../model/response/catalog-product-variant-response';
import { CatalogService } from '../services/catalog.service';
import { CartService } from '../services/cart.service';
import { addIcons } from 'ionicons';
import { FooterComponent } from "../shares/footer/footer.component";
import('@capacitor/share')

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon,
    IonTitle, IonContent, IonFooter, IonSkeletonText,
    FooterComponent
  ],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent implements OnInit {

  private route     = inject(ActivatedRoute);
  private router    = inject(Router);
  private catalog   = inject(CatalogService);
  private cartSvc   = inject(CartService);
  private toastCtrl = inject(ToastController);

  product: CatalogProductResponse | null = null;
  isLoading    = true;
  hasError     = false;
  isWishlisted = false;
  addedToCart  = false;

  // ── Gallery ──
  activeImageUrl: string | null = null;

  // ── Variants ──
  selectedVariant: CatalogProductVariantResponse | null = null;
  availableColors: string[] = [];
  availableSizes: string[] = [];
  selectedColor: string | null = null;
  selectedSize: string | null = null;

  cartCount$ = this.cartSvc.cartCount$;

  readonly canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  constructor() {
    addIcons({
      arrowBackOutline, cartOutline, locationOutline,
      checkmarkCircle, closeCircle, pricetagOutline,
      shareOutline, heartOutline, heart,
      chevronForwardOutline, starOutline, bagCheckOutline,
      copyOutline, logoWhatsapp, imagesOutline, checkmarkOutline,
    });
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (!productId) {
      this.hasError  = true;
      this.isLoading = false;
      return;
    }
    this.loadProduct(productId);
  }

  // ============================================================
  // LOAD
  // ============================================================
  private loadProduct(productId: string): void {
    this.isLoading = true;
    this.hasError  = false;

    this.catalog.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.activeImageUrl = product.imageUrl;
        this.initVariants(product);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load product:', err);
        this.hasError  = true;
        this.isLoading = false;
      },
    });
  }

  // ============================================================
  // GALLERY
  // ============================================================
  get galleryImages(): string[] {
    if (!this.product) return [];
    const gallery = this.product.images ?? [];
    const combined = [this.product.imageUrl, ...gallery];
    // de-duplicate while preserving order
    return combined.filter((url, i) => !!url && combined.indexOf(url) === i);
  }

  selectImage(url: string): void {
    this.activeImageUrl = url;
  }

  // ============================================================
  // VARIANTS
  // ============================================================
  private initVariants(product: CatalogProductResponse): void {
    if (!product.variants || product.variants.length === 0) return;

    this.availableColors = [...new Set(
      product.variants.map(v => v.color).filter((c): c is string => !!c)
    )];
    this.availableSizes = [...new Set(
      product.variants.map(v => v.size).filter((s): s is string => !!s)
    )];

    // Auto-select the first variant if there's only one axis or a single variant
    if (product.variants.length === 1) {
      this.selectVariantDirect(product.variants[0]);
    }
  }

  get hasVariants(): boolean {
    return !!this.product?.variants && this.product.variants.length > 0;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.tryResolveVariant();
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.tryResolveVariant();
  }

  private tryResolveVariant(): void {
    if (!this.product?.variants) return;

    const match = this.product.variants.find(v =>
      (this.availableColors.length === 0 || v.color === this.selectedColor) &&
      (this.availableSizes.length === 0 || v.size === this.selectedSize)
    );

    if (match) {
      this.selectVariantDirect(match);
    } else {
      this.selectedVariant = null;
    }
  }

  private selectVariantDirect(variant: CatalogProductVariantResponse): void {
    this.selectedVariant = variant;
    this.selectedColor = variant.color || this.selectedColor;
    this.selectedSize = variant.size || this.selectedSize;
    if (variant.imageUrl) {
      this.activeImageUrl = variant.imageUrl;
    }
  }

  get variantRequiredButNotSelected(): boolean {
    return this.hasVariants && !this.selectedVariant;
  }

  // ============================================================
  // COMPUTED — price / stock reflect selected variant when present
  // ============================================================
  get displayPrice(): number {
    if (!this.product) return 0;
    if (this.selectedVariant) {
      const base = this.selectedVariant.price ?? this.product.price;
      const extra = this.selectedVariant.extraPrice ?? 0;
      return base + extra;
    }
    return this.product.promotionActive ? this.product.promotionPrice : this.product.price;
  }

  get discountPercent(): number {
    if (!this.product || !this.product.promotionActive || this.selectedVariant) return 0;
    return Math.round(
      ((this.product.price - this.product.promotionPrice) / this.product.price) * 100
    );
  }

  get isInStock(): boolean {
    if (this.selectedVariant) return this.selectedVariant.inStock;
    return this.product?.inStock ?? false;
  }

  get availableQty(): number {
    if (this.selectedVariant) return this.selectedVariant.availableQty;
    return this.product?.availableQuantity ?? 0;
  }

  // ============================================================
  // ADD TO CART
  // ============================================================
  addToCart(): void {
    if (!this.product || !this.isInStock) return;

    if (this.variantRequiredButNotSelected) {
      this.showToast('Veuillez choisir une variante.', 'close-circle', 'danger');
      return;
    }

    this.cartSvc.addToCart(this.product);

    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 2000);

    this.showToast('Ajouté au panier !', 'checkmark-circle', 'success');
  }

  // ============================================================
  // SHARE — native app share sheet, Web Share API, or clipboard
  // ============================================================
  async share(): Promise<void> {
    if (!this.product) return;

    const url  = `${window.location.origin}/details/${this.product.productId}`;
    const text = `Découvrez ${this.product.productName} sur BIS — ${this.displayPrice} FCFA`;
    const title = this.product.productName;

    // 1) Native app (Capacitor) — only fires if @capacitor/share is installed
    //    and the app is actually running natively (Android/iOS build).
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title, text, url, dialogTitle: 'Partager ce produit' });
        return;
      }
    } catch {
      // @capacitor/core or @capacitor/share not installed / not native — fall through
    }

    // 2) Web Share API (mobile browsers, PWA)
    if (this.canNativeShare) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
      }
    }

    // 3) Clipboard fallback (desktop browsers)
    try {
      await navigator.clipboard.writeText(url);
      this.showToast('Lien copié dans le presse-papier !', 'copy-outline', 'primary');
    } catch {
      this.showToast('Impossible de copier le lien.', 'close-circle', 'danger');
    }
  }

  // ============================================================
  // WISHLIST
  // ============================================================
  toggleWishlist(): void {
    this.isWishlisted = !this.isWishlisted;
    const msg = this.isWishlisted ? 'Ajouté aux favoris' : 'Retiré des favoris';
    this.showToast(msg, this.isWishlisted ? 'heart' : 'heart-outline', 'primary');
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  goBack(): void {
    this.router.navigate(['/']);
  }

  navigateToShop(): void {
    if (this.product?.shopId) {
      this.router.navigate(['/shop', this.product.shopId]);
    }
  }

  // ============================================================
  // TOAST HELPER
  // ============================================================
  private async showToast(
    message: string,
    icon: string,
    color: 'success' | 'primary' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      icon,
      cssClass: 'bis-toast',
    });
    await toast.present();
  }
}