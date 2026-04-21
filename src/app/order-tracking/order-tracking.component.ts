import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, helpCircleOutline, checkmark, timeOutline,
  location, listOutline, storefrontOutline,
  bagCheckOutline, cogOutline, bicycleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { OrderService, Order } from '../services/order.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, DatePipe],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order?: Order;
  private sub!: Subscription;

  get statusIcon(): string {
    const map: Record<string, string> = {
      confirmed: 'bag-check-outline',
      preparing: 'cog-outline',
      shipped: 'bicycle-outline',
      delivered: 'checkmark-circle-outline',
    };
    return map[this.order?.status ?? 'confirmed'];
  }

  get statusTitle(): string {
    const map: Record<string, string> = {
      confirmed: 'Commande confirmée !',
      preparing: 'En cours de préparation',
      En_livraison: 'En route vers vous',
      shipped: 'En route vers vous',
      delivered: 'Commande livrée !',
    };
    return map[this.order?.status ?? 'confirmed'];
  }

  get statusSubtitle(): string {
    const map: Record<string, string> = {
      confirmed: 'Votre paiement a été validé avec succès.',
      preparing: 'Le vendeur prépare votre colis.',
      shipped: `Livraison estimée à ${this.order?.estimatedDelivery}`,
      delivered: 'Merci pour votre confiance ! 🎉',
    };
    return map[this.order?.status ?? 'confirmed'];
  }

  constructor(
    private route: ActivatedRoute,
    public navCtrl: NavController,
    private orderService: OrderService,
  ) {
    addIcons({
      arrowBackOutline, helpCircleOutline, checkmark, timeOutline,
      location, listOutline, storefrontOutline,
      bagCheckOutline, cogOutline, bicycleOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) {
        // Subscribe to live order updates
        this.sub = this.orderService.orders$.subscribe(orders => {
          this.order = orders.find(o => o.id === id);
        });
      }
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  goToOrders() { this.navCtrl.navigateRoot('/orders'); }
  goToCatalog() { this.navCtrl.navigateRoot('/catalog'); }
}
