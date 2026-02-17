import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonicModule, NavController, IonContent } from '@ionic/angular'; // Importe IonContent
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { IonModal } from '@ionic/angular/standalone';
import { 
  addOutline, arrowForwardOutline, cartOutline, eyeOutline, 
  heartOutline, optionsOutline, searchOutline, pricetagOutline,
  cashOutline, walletOutline, gridOutline, bagHandleOutline,
  locationOutline, storefrontOutline
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { Catalogue } from '../services/catalogue';
import { Cart } from '../services/cart';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [IonicModule, ProductCardComponent, CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit, OnDestroy {
  @ViewChild('filterModal') modal!: IonModal;
  @ViewChild(IonContent) ionContent!: IonContent; // Référence à ion-content

  cartCount: number = 0;
  private cartSub!: Subscription;
  products: CatalogProductResponse[] = [];
  isLoading = false;
  isHeaderCompact: boolean = false; // Nouvelle variable pour le header compact

  queryParams: CatalogQueryParams = {
    page: 0,
    size: 10,
    maxPrice: 5000,
    radiusKm: 10,
    inStockOnly: false,
    promotionOnly: false,
    keyword: ''
  };

  constructor(
    private catalogService: Catalogue,  
    private cartService: Cart, 
    private navCtrl: NavController
  ) {
    addIcons({ 
      eyeOutline, cartOutline, optionsOutline, searchOutline, 
      addOutline, arrowForwardOutline, heartOutline, pricetagOutline,
      cashOutline, walletOutline, gridOutline, bagHandleOutline,
      locationOutline, storefrontOutline
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.cartSub = this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnDestroy() {
    if (this.cartSub) this.cartSub.unsubscribe();
  }

  async openFilters() {
    await this.modal.present();
  }

  goToCart() {
    this.navCtrl.navigateForward('/cart');
  }

  loadProducts(append: boolean = false) {
    this.isLoading = true;
    this.catalogService.search(this.queryParams).subscribe({
      next: (response) => {
        this.products = append ? [...this.products, ...response.content] : response.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any) {
    this.queryParams.keyword = event.detail.value;
    this.updateFilters();
  }

  onPriceChange(event: any) {
    this.queryParams.maxPrice = event.detail.value;
    this.updateFilters();
  }

  updateFilters() {
    this.queryParams.page = 0;
    this.loadProducts();
  }

  applyFilters() {
    this.updateFilters();
    this.modal.dismiss();
  }

  resetFilters() {
    this.queryParams = { 
      page: 0, 
      size: 10, 
      maxPrice: 5000, 
      radiusKm: 10,
      inStockOnly: false,
      promotionOnly: false,
      keyword: ''
    };
    this.loadProducts();
  }

  loadMore(event: any) {
    this.queryParams.page!++;
    this.loadProducts(true);
    event.target.complete();
  }

  // --- NOUVELLE LOGIQUE POUR L'EFFET WAOUH ---
  async onScroll(event: CustomEvent) {
    const scrollPosition = event.detail.scrollTop;
    // Déclenche le compactage après un certain seuil de défilement (ex: 80px)
    this.isHeaderCompact = scrollPosition > 80; 
  }
}