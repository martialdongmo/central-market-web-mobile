import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { locationOutline, pricetagOutline, eyeOutline, cartOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';
import { CatalogProductResponse } from '../model/catalog-product-response.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [IonicModule, CommonModule,RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: CatalogProductResponse;

  constructor() {
    addIcons({ locationOutline, pricetagOutline, eyeOutline, cartOutline });
  }
}