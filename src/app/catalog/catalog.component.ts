import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { IonModal } from '@ionic/angular/standalone';
import { addOutline, arrowForwardOutline, cartOutline, eyeOutline, heartOutline, optionsOutline, searchOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { Catalogue } from '../services/catalogue';

@Component({
  selector: 'app-catalog',
  standalone: true, // Assure-toi qu'il est bien standalone
  imports: [IonicModule, ProductCardComponent, CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  @ViewChild('filterModal') modal!: IonModal;

  // Variables de données
  products: CatalogProductResponse[] = [];
  isLoading = false;

  queryParams: CatalogQueryParams = {
    page: 0,
    size: 10, // On commence petit pour la pagination
    maxPrice: 500,
    radiusKm: 10,
    inStockOnly: false,
    promotionOnly: false,
    keyword: ''
  };

  constructor(private catalogService: Catalogue) {
    addIcons({ 
      eyeOutline, cartOutline, optionsOutline, searchOutline, 
      addOutline, arrowForwardOutline, heartOutline 
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  /**
   * Charge les produits depuis le service
   * @param append Si vrai, ajoute aux produits existants (pour l'infinite scroll)
   */
  loadProducts(append: boolean = false) {
    this.isLoading = true;
    
    this.catalogService.search(this.queryParams).subscribe({
      next: (response) => {
        if (append) {
          this.products = [...this.products, ...response.content];
        } else {
          this.products = response.content;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur API:', err);
        this.isLoading = false;
      }
    });
  }

  // --- ACTIONS ---

  onSearch(event: any) {
    this.queryParams.keyword = event.detail.value;
    this.queryParams.page = 0; // Reset pagination
    this.loadProducts();
  }

  applyFilters() {
    this.queryParams.page = 0;
    this.loadProducts();
    this.modal.dismiss();
  }

  resetFilters() {
    this.queryParams = { 
      page: 0, 
      size: 10, 
      maxPrice: 1000, 
      radiusKm: 10,
      inStockOnly: false,
      promotionOnly: false 
    };
    this.loadProducts();
  }

  loadMore(event: any) {
    this.queryParams.page!++; // Incrémente la page
    this.loadProducts(true); // 'true' pour ajouter à la suite
    event.target.complete();
  }

  openFilters() {
    if (this.modal) this.modal.present();
  }
}