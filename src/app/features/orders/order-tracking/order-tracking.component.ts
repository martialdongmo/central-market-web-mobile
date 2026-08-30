import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, NavController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locationOutline,
  callOutline,
  personOutline,
  documentTextOutline,
  walletOutline,
  cubeOutline,
  timeOutline,
  storefrontOutline,
  checkmarkOutline,
  checkmarkCircleOutline,
  checkmarkDoneOutline,
  closeCircleOutline,
  ellipse,
  ellipseOutline,
  calendarOutline,
  cardOutline,
  imageOutline,
  alertCircleOutline,
  refreshOutline,
  gitBranchOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { ShopDeliveryStatus, ShopDeliveryStatusLabel } from 'src/app/core/model/enums/shopDeliveryStatus';
import { DeliveryType, DELIVERY_TYPE_LABELS } from 'src/app/core/model/enums/deliveryType';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from 'src/app/core/model/enums/payment-method';
import { OrderStatus, OrderStatusLabel } from 'src/app/core/model/response/orders/orderStatus';
import { CustomerOrderDetailResponse } from 'src/app/core/model/response/orders/customer.order.detail.response';
import { CustomCurrencyPipe } from 'src/app/core/services/custom.currency.pipe';
import { OrdersService } from 'src/app/core/services/orders.service';
import { FooterComponent } from 'src/app/shared/footer/footer.component';

interface ProgressStep {
  key: OrderStatus;
  labelKey: string;
  descriptionKey: string;
}

/** Ordre déclaré de l'enum OrderStatus (enum numérique côté TS/Java) — sert
 *  à retrouver le bon statut que le backend renvoie un index numérique
 *  (ordinal Java) ou le nom littéral ("SHIPPED"). */
const ORDER_STATUS_ORDINALS: OrderStatus[] = [
  OrderStatus.CREATED, OrderStatus.DRAFF, OrderStatus.PAYMENT_PENDING, OrderStatus.PENDING_CONFIRMATION,
  OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED,
  OrderStatus.COMPLETED, OrderStatus.CANCELED, OrderStatus.FAILED,
];

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, DatePipe, CustomCurrencyPipe, FooterComponent, TranslatePipe],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {

  order: CustomerOrderDetailResponse | null = null;
  isLoading = false;

  /** Étapes du parcours "normal" d'une commande (hors annulation/échec,
   *  gérés séparément par une bannière dédiée dans le template). */
  readonly progressSteps: ProgressStep[] = [
    { key: OrderStatus.CREATED,         labelKey: 'orders_progress.order_placed',       descriptionKey: 'orders_progress.order_placed_desc' },
    { key: OrderStatus.PAYMENT_PENDING, labelKey: 'orders_progress.payment_pending',    descriptionKey: 'orders_progress.payment_pending_desc' },
    { key: OrderStatus.PAID,            labelKey: 'orders_progress.payment_confirmed',  descriptionKey: 'orders_progress.payment_confirmed_desc' },
    { key: OrderStatus.CONFIRMED,       labelKey: 'orders_progress.order_confirmed',    descriptionKey: 'orders_progress.order_confirmed_desc' },
    { key: OrderStatus.SHIPPED,         labelKey: 'orders_progress.shipped',            descriptionKey: 'orders_progress.shipped_desc' },
    { key: OrderStatus.DELIVERED,       labelKey: 'orders_progress.delivered',          descriptionKey: 'orders_progress.delivered_desc' },
    { key: OrderStatus.COMPLETED,       labelKey: 'orders_progress.completed',          descriptionKey: 'orders_progress.completed_desc' },
  ];

  private subs: Subscription[] = [];
  private orderId: string | null = null;

  private route        = inject(ActivatedRoute);
  private orderService  = inject(OrdersService);
  private navCtrl       = inject(NavController);

  constructor() {
    addIcons({
      arrowBackOutline, locationOutline, callOutline, personOutline,
      documentTextOutline, walletOutline, cubeOutline, timeOutline,
      storefrontOutline, checkmarkOutline, checkmarkCircleOutline,
      checkmarkDoneOutline, closeCircleOutline,
      ellipse, ellipseOutline, calendarOutline, cardOutline,
      imageOutline, alertCircleOutline, refreshOutline, gitBranchOutline,
    });
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.getDetails(this.orderId);
    } else {
      console.error('No order ID in route.');
      this.goBack();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  getDetails(id: string): void {
    this.isLoading = true;
    const sub = this.orderService.getCustomerOrderDetail(id).subscribe({
      next:  (res) => { this.order = res; this.isLoading = false; },
      error: (err) => { console.error(err); this.isLoading = false; },
    });
    this.subs.push(sub);
  }

  retry(): void {
    if (this.orderId) this.getDetails(this.orderId);
  }

  goBack(): void { this.navCtrl.back(); }

  /* ── Normalisation du statut ──────────────────────────────────────────
   *  Le backend peut renvoyer le statut sous 3 formes selon la sérialisation
   *  Jackson : l'ordinal numérique (0, 6, 8...), le nom littéral ("SHIPPED"),
   *  ou une chaîne numérique ("6"). On normalise vers l'enum TS dans tous
   *  les cas pour ne plus avoir à dupliquer la logique partout. */
  private resolveStatus(raw: unknown): OrderStatus {
    if (typeof raw === 'number') {
      return ORDER_STATUS_ORDINALS[raw] ?? OrderStatus.CREATED;
    }
    if (typeof raw === 'string') {
      const byName = (OrderStatus as unknown as Record<string, OrderStatus>)[raw];
      if (byName !== undefined) return byName;
      const asNumber = parseInt(raw, 10);
      if (!isNaN(asNumber)) return ORDER_STATUS_ORDINALS[asNumber] ?? OrderStatus.CREATED;
    }
    return OrderStatus.CREATED;
  }

  get currentStatus(): OrderStatus | null {
    return this.order ? this.resolveStatus(this.order.status) : null;
  }

  get isCanceledOrFailed(): boolean {
    return this.currentStatus === OrderStatus.CANCELED || this.currentStatus === OrderStatus.FAILED;
  }

  /* ── Progress stepper helpers ── */

  private currentStepIndex(): number {
    const status = this.currentStatus;
    if (status === null) return -1;
    return this.progressSteps.findIndex(s => s.key === status);
  }

  isStepDone(key: OrderStatus): boolean {
    const cur = this.currentStepIndex();
    const idx = this.progressSteps.findIndex(s => s.key === key);
    return cur > idx;
  }

  isStepActive(key: OrderStatus): boolean {
    const cur = this.currentStepIndex();
    const idx = this.progressSteps.findIndex(s => s.key === key);
    return cur === idx;
  }

  get activeStepDescriptionKey(): string | null {
    const idx = this.currentStepIndex();
    return idx >= 0 ? this.progressSteps[idx].descriptionKey : null;
  }

  /* ── Statut de la commande : libellé / couleur / icône ── */

  getStatusLabel(status: unknown): string {
    return OrderStatusLabel[this.resolveStatus(status)] ?? 'En traitement';
  }

  getStatusClass(status: unknown): string {
    switch (this.resolveStatus(status)) {
      case OrderStatus.PAID:
      case OrderStatus.CONFIRMED:
        return 'pill-blue';
      case OrderStatus.SHIPPED:
        return 'pill-indigo';
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return 'pill-green';
      case OrderStatus.CANCELED:
      case OrderStatus.FAILED:
        return 'pill-red';
      default:
        return 'pill-amber'; // CREATED, DRAFF, PAYMENT_PENDING, PENDING_CONFIRMATION
    }
  }

  getStatusIcon(status: unknown): string {
    switch (this.resolveStatus(status)) {
      case OrderStatus.PAID:
        return 'card-outline';
      case OrderStatus.CONFIRMED:
        return 'checkmark-circle-outline';
      case OrderStatus.SHIPPED:
        return 'cube-outline';
      case OrderStatus.DELIVERED:
        return 'checkmark-circle-outline';
      case OrderStatus.COMPLETED:
        return 'checkmark-done-outline';
      case OrderStatus.CANCELED:
      case OrderStatus.FAILED:
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
  }

  /* ── Statut de livraison par boutique ── */

  getDeliveryClass(status: ShopDeliveryStatus): string {
    const m: Record<ShopDeliveryStatus, string> = {
      [ShopDeliveryStatus.PENDING]:          'dp-pending',
      [ShopDeliveryStatus.CONFIRMED]:        'dp-confirmed',
      [ShopDeliveryStatus.PREPARING]:        'dp-preparing',
      [ShopDeliveryStatus.READY_FOR_PICKUP]: 'dp-ready',
      [ShopDeliveryStatus.OUT_FOR_DELIVERY]: 'dp-out',
      [ShopDeliveryStatus.DELIVERED]:        'dp-delivered',
      [ShopDeliveryStatus.FAILED]:           'dp-failed',
      [ShopDeliveryStatus.CANCELED]:         'dp-canceled',
    };
    return m[status] ?? 'dp-pending';
  }

  formatDeliveryStatus(status: ShopDeliveryStatus): string {
    return ShopDeliveryStatusLabel[status] ?? 'En attente';
  }

  /* ── Adresse / mode de retrait ── */

  getAddressLabelKey(deliveryType: DeliveryType): string {
    return deliveryType === DeliveryType.PICKUP
      ? 'orders.pickup_location'
      : 'orders.delivery_address';
  }

  /* ── Moyen de paiement ── */

  formatPaymentMethod(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] ?? 'Non renseigné';
  }
}