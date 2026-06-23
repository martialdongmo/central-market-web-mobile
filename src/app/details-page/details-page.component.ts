import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent, IonIcon, NavController, ToastController, IonTitle,IonHeader,IonFooter,IonButtons,IonToolbar,IonButton,IonSkeletonText} from '@ionic/angular/standalone';
import { arrowBackOutline, heartOutline, heart, storefront, cartOutline, bagCheckOutline, checkmarkCircle, chevronForwardOutline, closeCircle, copyOutline, locationOutline, logoWhatsapp, pricetagOutline, shareOutline, starOutline } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';
import { CatalogService } from '../services/catalog.service';
import { CartService } from '../services/cart.service';
import { addIcons } from 'ionicons';

@Component({ selector: 'app-details-page',
   standalone: true, 
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon,
    IonTitle, IonContent, IonFooter, IonSkeletonText,
  ],
   templateUrl: './details-page.component.html', 
   styleUrls: ['./details-page.component.scss'] 
  })
export class DetailsPageComponent implements OnInit {

   private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private catalog      = inject(CatalogService);
  private cartSvc      = inject(CartService);
  private toastCtrl    = inject(ToastController);
 
  product: CatalogProductResponse | null = null;
  isLoading    = true;
  hasError     = false;
  isWishlisted = false;
  addedToCart  = false;   // drives the brief "✓ Ajouté" feedback on the button
 
  cartCount$ = this.cartSvc.cartCount$;
 
  // Share API support flag
  readonly canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;


  constructor() {
    addIcons({
      arrowBackOutline, cartOutline, locationOutline,
      checkmarkCircle, closeCircle, pricetagOutline,
      shareOutline, heartOutline, heart,
      chevronForwardOutline, starOutline, bagCheckOutline,
      copyOutline, logoWhatsapp,
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
  // LOAD — calls CatalogService.getProduct()
  // Maps to: GET /api/v1/bis/catalog/product-1/{productId}
  // ============================================================
  private loadProduct(productId: string): void {
    this.isLoading = true;
    this.hasError  = false;
 
    this.catalog.getProduct(productId).subscribe({
      next: (product) => {
        this.product   = product;
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
  // ADD TO CART
  // CartService.addToCart() accepts CatalogProductResponse directly.
  // ============================================================
  addToCart(): void {
    if (!this.product || !this.product.inStock) return;
    this.cartSvc.addToCart(this.product);
 
    // Brief visual feedback on the button
    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 2000);
 
    this.showToast('Ajouté au panier !', 'checkmark-circle', 'success');
  }
 
  // ============================================================
  // SHARE
  // Uses Web Share API when available (Capacitor/mobile),
  // falls back to copying the link to clipboard.
  // ============================================================
  async share(): Promise<void> {
    if (!this.product) return;
 
    const url  = `${window.location.origin}/details/${this.product.productId}`;
    const text = `Découvrez ${this.product.productName} sur BIS — ${this.product.promotionActive
      ? this.product.promotionPrice
      : this.product.price} FCFA`;
 
    if (this.canNativeShare) {
      try {
        await navigator.share({
          title: this.product.productName,
          text,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if ((err as DOMException).name === 'AbortError') return;
      }
    }
 
    // Clipboard fallback
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
  // COMPUTED HELPERS
  // ============================================================
  get displayPrice(): number {
    if (!this.product) return 0;
    return this.product.promotionActive
      ? this.product.promotionPrice
      : this.product.price;
  }
 
  get discountPercent(): number {
    if (!this.product || !this.product.promotionActive) return 0;
    return Math.round(
      ((this.product.price - this.product.promotionPrice) / this.product.price) * 100
    );
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
