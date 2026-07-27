import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline, arrowBackOutline, cardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cancel-payment',
  templateUrl: './cancel-payment.component.html',
  styleUrls: ['./cancel-payment.component.scss'],
  imports: [IonContent, IonIcon, IonButton, RouterLink],
})
export class CancelPaymentComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderId: string = '';

  constructor() {
    addIcons({ closeCircleOutline, arrowBackOutline, cardOutline });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
  }

  retryPayment(): void {
    this.router.navigate([`/confirmation-order/${this.orderId}`]);
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }
}