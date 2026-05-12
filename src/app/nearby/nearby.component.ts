import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { location, flash, storefront, navigate, arrowForward, mapOutline } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Catalogue } from '../services/catalogue';

@Component({ selector: 'app-nearby', standalone: true, imports: [CommonModule, IonContent, IonIcon], templateUrl: './nearby.component.html', styleUrls: ['./nearby.component.scss'] })
export class NearbyComponent implements OnInit {
  nearbyProducts: CatalogProductResponse[] = [];
  isLoading = true;
  constructor(private catalogService: Catalogue, private router: Router) {
    addIcons({ location, flash, storefront, navigate, arrowForward, mapOutline });
  }
  ngOnInit() {
    this.catalogService.getNearby({ page: 0, size: 20 }).subscribe({
      next: r => { this.nearbyProducts = r.content.sort((a,b) => (a.distanceKm||0)-(b.distanceKm||0)); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
  goToDetails(id: string) { this.router.navigate(['/details', id]); }
}
