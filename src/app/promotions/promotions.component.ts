import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonRouterOutlet, IonApp } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { flame, giftOutline, chevronForward } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { FooterComponent } from "../shares/footer/footer.component";

@Component({ selector: 'app-promotions', standalone: true, 
  imports: [CommonModule, IonContent, IonIcon, IonRouterOutlet, IonApp, FooterComponent], 
  templateUrl: './promotions.component.html', styleUrls: ['./promotions.component.scss'] })
export class PromotionsComponent implements OnInit {

  ngOnInit(): void {
      
  }
  

}
