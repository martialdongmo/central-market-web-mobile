import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonContent, IonIcon, NavController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bagOutline, locationOutline } from 'ionicons/icons';

import { Subscription } from 'rxjs';
import { CustomerOrderService, OrderStatus, OrderSummaryResponse } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [IonSpinner, CommonModule, IonContent, IonIcon, DatePipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: OrderSummaryResponse[] = [];
  totalElements = 0;
  loading = false;

  private sub!: Subscription;

  constructor(
    public navCtrl: NavController,
    private orderService: CustomerOrderService,
  ) {
    addIcons({ arrowBackOutline, bagOutline, locationOutline });
  }

  ngOnInit(): void {
    this.loading = true;
    this.sub = this.orderService
      .getMyOrders({ page: 0, size: 20 })
      .subscribe(page => {
        this.orders        = page.content;
        this.totalElements = page.totalElements;
        this.loading       = false;
      });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // Maps API status → label FR
  statusLabel(status: OrderStatus): string {
    const map: { [key: string]: string } = {
      CREATED:              'Créée',
      DRAFF:                'Brouillon',
      PAYMENT_PENDING:      'Paiement en attente',
      PENDING_CONFIRMATION: 'En attente de confirmation',
      PAID:                 'Payée',
      CONFIRMED:            'Confirmée',
      SHIPPED:              'En livraison',
      DELIVERED:            'Livrée',
      COMPLETED:            'Terminée',
      CANCELED:             'Annulée',
      FAILED:               'Échouée',
    };
    return map[status as string] ?? status;
  }

  // Maps API status → CSS class
  statusClass(status: OrderStatus): string {
    const map: { [key: string]: string } = {
      CONFIRMED:            'status-confirmed',
      PAID:                 'status-paid',
      SHIPPED:              'status-shipped',
      DELIVERED:            'status-delivered',
      COMPLETED:            'status-completed',
      CANCELED:             'status-cancelled',
      FAILED:               'status-failed',
      PAYMENT_PENDING:      'status-pending',
      PENDING_CONFIRMATION: 'status-pending',
      CREATED:              'status-created',
      DRAFF:                'status-draff',
    };
    return map[status as string] ?? '';
  }

  openOrder(id: string): void {
    this.navCtrl.navigateForward(`/order-tracking/${id}`);
  }

  goToCatalog(): void { this.navCtrl.navigateRoot('/catalog'); }
}