import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // Utile si tu ajoutes des sélections (taille, couleur)
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, cartOutline, heartOutline, 
  locationOutline, storefrontOutline 
} from 'ionicons/icons';

import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { Catalogue } from '../services/catalogue';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss'],
})
export class DetailsPageComponent implements OnInit {
  product?: CatalogProductResponse;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private catalogService: Catalogue
  ) {
    addIcons({ 
      arrowBackOutline, cartOutline, heartOutline, 
      locationOutline, storefrontOutline 
    });
  }

ngOnInit() {
  this.route.paramMap.subscribe(params => {
    // ICI : productId au lieu de id
    const idFromUrl = params.get('productId'); 
    console.log("ID récupéré de l'URL:", idFromUrl);

    if (idFromUrl) {
      this.loadProduct(idFromUrl);
    }
  });
}

  loadProduct(id: string) {
    this.isLoading = true;
    this.catalogService.getDetails(id).subscribe({
      next: (data) => {
        this.product = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Produit introuvable', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    // Utiliser window.history.back() fonctionne, mais attention si l'utilisateur arrive via un lien externe
    window.history.back();
  }
}