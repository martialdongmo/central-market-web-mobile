import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart';

export type OrderStatus = 'confirmed' | 'preparing' | 'shipped' | 'delivered';

export interface OrderStep {
  status: OrderStatus;
  label: string;
  description: string;
  time?: string;
  done: boolean;
  active: boolean;
}

export interface Order {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  estimatedDelivery: string;
  address: string;
  trackingSteps: OrderStep[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersSource = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSource.asObservable();

  get orders(): Order[] { return this.ordersSource.value; }

  placeOrder(items: CartItem[], total: number, address: string): Order {
    const id = `CM-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const order: Order = {
      id,
      date: now,
      items: [...items],
      total,
      status: 'confirmed',
      estimatedDelivery: this.getEstimatedDelivery(),
      address,
      trackingSteps: this.buildSteps('confirmed', now),
    };

    const current = this.ordersSource.value;
    this.ordersSource.next([order, ...current]);

    // Simulate progression after delays
    this.simulateProgression(id);

    return order;
  }

  getOrder(id: string): Order | undefined {
    return this.ordersSource.value.find(o => o.id === id);
  }

  private simulateProgression(orderId: string) {
    // preparing after 8s
    setTimeout(() => this.advanceOrder(orderId, 'preparing'), 8000);
    // shipped after 20s
    setTimeout(() => this.advanceOrder(orderId, 'shipped'), 20000);
  }

  private advanceOrder(orderId: string, status: OrderStatus) {
    const orders = this.ordersSource.value.map(o => {
      if (o.id !== orderId) return o;
      const now = new Date();
      return { ...o, status, trackingSteps: this.buildSteps(status, o.date, now) };
    });
    this.ordersSource.next(orders);
  }

  private buildSteps(currentStatus: OrderStatus, orderDate: Date, now?: Date): OrderStep[] {
    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(currentStatus);
    const t = now ?? orderDate;

    const definitions = [
      { status: 'confirmed' as OrderStatus, label: 'Commande confirmée', description: 'Votre commande a été reçue et validée.' },
      { status: 'preparing' as OrderStatus, label: 'En préparation', description: 'Votre commande est en cours de préparation par le vendeur.' },
      { status: 'shipped' as OrderStatus, label: 'En livraison', description: 'Votre colis est en route ! Le livreur arrive bientôt.' },
      { status: 'delivered' as OrderStatus, label: 'Livré', description: 'Votre commande a été livrée avec succès.' },
    ];

    return definitions.map((def, i) => ({
      ...def,
      done: i < currentIdx,
      active: i === currentIdx,
      time: i <= currentIdx ? this.formatTime(new Date(t.getTime() - (currentIdx - i) * 300000)) : undefined,
    }));
  }

  private getEstimatedDelivery(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private formatTime(d: Date): string {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
