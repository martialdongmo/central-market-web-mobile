import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { flame, giftOutline, chevronForward } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Catalogue } from '../services/catalogue';

@Component({ selector: 'app-promotions', standalone: true, imports: [CommonModule, IonContent, IonIcon], templateUrl: './promotions.component.html', styleUrls: ['./promotions.component.scss'] })
export class PromotionsComponent implements OnInit {
  promoProducts: CatalogProductResponse[] = [];
  isLoading = true;
  constructor(private catalogService: Catalogue, private router: Router) { addIcons({ flame, giftOutline, chevronForward }); }
  ngOnInit() {
    this.catalogService.getPromotions({ page: 0, size: 20 }).subscribe({
      next: r => { this.promoProducts = r.content; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
  goToDetails(id: string) { this.router.navigate(['/details', id]); }
}
