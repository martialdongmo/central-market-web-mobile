import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bagOutline, locationOutline } from 'ionicons/icons';
import { OrderService, Order, OrderStatus } from '../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, DatePipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  private sub!: Subscription;

  constructor(public navCtrl: NavController, private orderService: OrderService) {
    addIcons({ arrowBackOutline, bagOutline, locationOutline });
  }

  ngOnInit() {
    this.sub = this.orderService.orders$.subscribe(orders => { this.orders = orders; });
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      confirmed: 'Confirmée', preparing: 'En préparation',
      shipped: 'En livraison', delivered: 'Livrée',
    };
    return map[status];
  }

  openOrder(id: string) { this.navCtrl.navigateForward(`/order-tracking/${id}`); }
  goToCatalog() { this.navCtrl.navigateRoot('/catalog'); }
}
