import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, helpCircleOutline, checkmark, timeOutline,
  location, listOutline, storefrontOutline,
  bagCheckOutline, cogOutline, bicycleOutline, checkmarkCircleOutline
} from 'ionicons/icons';

import { Subscription } from 'rxjs';
import { CustomerOrderDetailResponse, CustomerOrderService, OrderStep, TrackingStatus } from '../services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [IonSpinner, CommonModule, IonContent, IonIcon, DatePipe],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order?: CustomerOrderDetailResponse;
  trackingSteps: OrderStep[] = [];
  estimatedDelivery = '';
  loading = false;

  private sub!: Subscription;

  // ── Computed getters ──────────────────────────────
  get trackingStatus(): TrackingStatus {
    if (!this.order) return 'confirmed';
    return this.orderService.toTrackingStatus(this.order.status);
  }

  get statusIcon(): string {
    const map: Record<TrackingStatus, string> = {
      confirmed: 'bag-check-outline',
      preparing: 'cog-outline',
      shipped:   'bicycle-outline',
      delivered: 'checkmark-circle-outline',
    };
    return map[this.trackingStatus];
  }

  get statusTitle(): string {
    const map: Record<TrackingStatus, string> = {
      confirmed: 'Commande confirmée !',
      preparing: 'En cours de préparation',
      shipped:   'En route vers vous',
      delivered: 'Commande livrée !',
    };
    return map[this.trackingStatus];
  }

  get statusSubtitle(): string {
    const map: Record<TrackingStatus, string> = {
      confirmed: 'Votre paiement a été validé avec succès.',
      preparing: 'Le vendeur prépare votre colis.',
      shipped:   `Livraison estimée à ${this.estimatedDelivery}`,
      delivered: 'Merci pour votre confiance ! 🎉',
    };
    return map[this.trackingStatus];
  }

  constructor(
    private route: ActivatedRoute,
    public navCtrl: NavController,
    private orderService: CustomerOrderService,
  ) {
    addIcons({
      arrowBackOutline, helpCircleOutline, checkmark, timeOutline,
      location, listOutline, storefrontOutline,
      bagCheckOutline, cogOutline, bicycleOutline, checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('orderId');
      if (!id) return;
      this.loading = true;

      this.sub = this.orderService.getOrderDetail(id).subscribe(order => {
        this.loading = false;
        if (!order) return;
        this.order = order;
        this.trackingSteps    = this.orderService.buildTrackingSteps(order.status, order.createdAt);
        this.estimatedDelivery = this.orderService.getEstimatedDelivery(order.createdAt);
      });
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  goToOrders()  { this.navCtrl.navigateRoot('/orders'); }
  goToCatalog() { this.navCtrl.navigateRoot('/catalog'); }
}