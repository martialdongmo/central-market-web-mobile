import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonContent, IonIcon, IonSpinner, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline, documentTextOutline, downloadOutline,
  navigateCircleOutline, arrowForwardOutline,
  storefrontOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { OrdersService } from 'src/app/services/orders.service';
import { OrderResponse } from 'src/app/model/response/orderResponse';
import { InvoiceService } from 'src/app/services/invoice.service';
import { CustomCurrencyPipe } from "../../services/custom.currency.pipe";


@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonSpinner, IonSkeletonText,
    CurrencyPipe, DatePipe,
    CustomCurrencyPipe
],
})
export class PaymentSuccessComponent implements OnInit {

  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private orderService = inject(OrdersService);
  private invoiceService = inject(InvoiceService);


  order:   OrderResponse | null = null;
  loading  = false;

  constructor() {
    addIcons({
      checkmarkOutline, documentTextOutline, downloadOutline,
      navigateCircleOutline, arrowForwardOutline,
      storefrontOutline, checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    if (orderId) this.loadOrder(orderId);
  }

  private loadOrder(id: string): void {
    this.loading = true;
    this.orderService.getOrder(id).subscribe({
      next:  order => { this.order = order; this.loading = false; },
      error: err   => { console.error(err); this.loading = false; }
    });
  }

  // ─── Download invoice ────────────────────────────────────


  async downloadInvoice(): Promise<void> {
    if (!this.order) return;

    try {
      await this.invoiceService.downloadInvoice(this.order.id);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  }



  // ─── Label helper ────────────────────────────────────────
  paymentLabel(method?: string): string {
    if (!method) return '';
    return method.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  // ─── Navigation ─────────────────────────────────────────
  trackOrder(): void {
    this.router.navigate(['/order-tracking', this.order?.id]);
  }

  continueShopping(): void {
    this.router.navigate(['/catalog']);
  }
}