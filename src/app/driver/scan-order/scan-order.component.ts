import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonSpinner, 
  IonProgressBar,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { qrCodeOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { OrdersService } from 'src/app/services/orders.service';
import { ValidateOrderRequest } from 'src/app/model/requests/validate-order-request';

@Component({
  selector: 'app-scan-order',
  templateUrl: './scan-order.component.html',
  styleUrls: ['./scan-order.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
    IonProgressBar,
    IonIcon,
    IonCard,
    IonCardContent
  ],
})
export class ScanOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ordersService = inject(OrdersService);

  orderCode: string = '';
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  constructor() {
    addIcons({ qrCodeOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  ngOnInit(): void {
    // Récupération automatique du code de validation depuis l'URL (?code=...)
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.orderCode = params['code'];
      }
    });
  }

  validerCommande(): void {
    if (!this.orderCode.trim()) {
      this.isError = true;
      this.message = 'Aucun code de validation trouvé.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    // Construction du payload attendu par le backend (@RequestBody ValidateOrderRequest)
    const requestPayload: ValidateOrderRequest = {
      validationCode: this.orderCode.trim()
    };
    
    // Appel à votre API backend
    this.ordersService.validateOrder(requestPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.isError = false;
        this.message = 'Commande validée avec succès !';
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.message = err?.error?.message || 'Erreur lors de la validation de la commande.';
      }
    });
  }
}