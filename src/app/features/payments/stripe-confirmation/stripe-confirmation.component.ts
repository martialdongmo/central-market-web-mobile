import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSpinner, IonIcon, IonButton } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, switchMap, takeWhile } from 'rxjs';
import { addIcons } from 'ionicons';
import { cardOutline, alertCircleOutline, storefrontOutline } from 'ionicons/icons';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-stripe-confirmation',
  templateUrl: './stripe-confirmation.component.html',
  styleUrls: ['./stripe-confirmation.component.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner, IonIcon, IonButton],
})
export class StripeConfirmationComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private destroyRef = inject(DestroyRef);

  orderId: string = '';
  errorMessage: string = '';

  constructor() {
    addIcons({ cardOutline, alertCircleOutline, storefrontOutline });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    // const referenceId = this.route.snapshot.queryParamMap.get('reference');

    if (!this.orderId) {
      this.errorMessage = 'Référence de paiement introuvable.';
      return;
    }

    this.waitForStripeConfirmation(this.orderId);
  }

  private waitForStripeConfirmation(orderId: string): void {
    const maxAttempts = 15; // 15 x 2s = 30s max
    let attempts = 0;

    timer(0, 2000).pipe(
      switchMap(() => this.paymentService.getPaymentStatus(orderId)),
      takeWhile(res => {
        attempts++;
        const stillPending = res.status === 'PENDING';
        return stillPending && attempts < maxAttempts;
      }, true),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        if (res.status === 'SUCCESS') {
          this.router.navigate([`/payment-success/${this.orderId}`]);
        } else if (res.status === 'FAILED') {
          this.errorMessage = 'Le paiement a été refusé par la banque.';
        } else if (attempts >= maxAttempts) {
          this.errorMessage = 'Paiement en cours de confirmation. Vérifiez votre commande dans quelques instants.';
        }
      },
      error: (err) => {
        console.error('Status polling error:', err);
        this.errorMessage = 'Erreur de connexion au serveur.';
      }
    });
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }
}