import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController, ToastController } from '@ionic/angular/standalone';
import { arrowBackOutline, heartOutline, heart, storefront, cartOutline } from 'ionicons/icons';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';

@Component({ selector: 'app-details-page', standalone: true, imports: [CommonModule, IonContent, IonIcon], templateUrl: './details-page.component.html', styleUrls: ['./details-page.component.scss'] })
export class DetailsPageComponent implements OnInit {
  product?: CatalogProductResponse;
  isLoading = true;
  isFav = false;
 

  ngOnInit(): void {
      
  }
}
