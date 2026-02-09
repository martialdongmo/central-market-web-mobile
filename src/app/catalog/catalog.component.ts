import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { IonModal } from '@ionic/angular/standalone';
import { 
  addOutline, arrowForwardOutline, cartOutline, eyeOutline, 
  heartOutline, optionsOutline, searchOutline, pricetagOutline,
  cashOutline, walletOutline, gridOutline, bagHandleOutline
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { Catalogue } from '../services/catalogue';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [IonicModule, ProductCardComponent, CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  @ViewChild('filterModal') modal!: IonModal;

  products: CatalogProductResponse[] = [];
  isLoading = false;

  queryParams: CatalogQueryParams = {
    page: 0,
    size: 10,
    maxPrice: 1000,
    radiusKm: 10,
    inStockOnly: false,
    promotionOnly: false,
    keyword: ''
  };

  constructor(private catalogService: Catalogue) {
    addIcons({ 
      eyeOutline, cartOutline, optionsOutline, searchOutline, 
      addOutline, arrowForwardOutline, heartOutline, pricetagOutline,
      cashOutline, walletOutline, gridOutline, bagHandleOutline
    });
  }

  ngOnInit() {
    this.loadProducts();
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
      maxPrice: 1000, 
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
}