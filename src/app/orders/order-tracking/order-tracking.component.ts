import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
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
import { OrdersService } from 'src/app/services/orders.service';
import { CustomerOrderDetailResponse } from 'src/app/model/response/orders/customer.order.detail.response';
import { CustomCurrencyPipe } from "../../services/custom.currency.pipe";
import { PaymentMethod } from 'src/app/model/enums/payment-method';
import { ShopDeliveryStatus } from 'src/app/model/enums/shopDeliveryStatus';
import { FooterComponent } from "src/app/shares/footer/footer.component";
import { TranslatePipe } from '@ngx-translate/core';


interface ProgressStep { key: string; label: string; }


@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, DatePipe, CurrencyPipe, CustomCurrencyPipe, FooterComponent, TranslatePipe],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
 
  order: CustomerOrderDetailResponse | null = null;
  isLoading = false;
 
  readonly progressSteps: ProgressStep[] = [
    { key: 'CREATED',              label: 'Order Placed'         },
    { key: 'PAYMENT_PENDING',      label: 'Awaiting Payment'     },
    { key: 'PAID',                 label: 'Payment Confirmed'    },
    { key: 'CONFIRMED',            label: 'Order Confirmed'      },
    { key: 'SHIPPED',              label: 'Shipped'              },
    { key: 'DELIVERED',            label: 'Delivered'            },
    { key: 'COMPLETED',            label: 'Completed'            },
  ];

  private readonly stepLabels: Record<string, string> = {
    'Order Placed': 'orders_status.order_placed',
    'Awaiting Payment': 'orders_status.awaiting_payment',
    'Payment Confirmed': 'orders_status.payment_confirmed',
    'Order Confirmed': 'orders_status.order_confirmed',
    'Shipped': 'orders_status.shipped_status',
    'Delivered': 'orders_status.delivered_status',
    'Completed': 'orders_status.completed',
  };

  getStepLabel(key: string): string {
    const label = this.progressSteps.find(s => s.key === key)?.label ?? key;
    return this.stepLabels[label] ?? label;
  }
 
  private readonly stepOrder = [
    'CREATED', 'DRAFF', 'PAYMENT_PENDING', 'PENDING_CONFIRMATION',
    'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED',
  ];
 
  private subs: Subscription[] = [];
  private orderId: string | null = null;
 
  private route        = inject(ActivatedRoute);
  private orderService = inject(OrdersService);
  private navCtrl      = inject(NavController);
 
  constructor() {
    addIcons({
      arrowBackOutline, locationOutline, callOutline, personOutline,
      documentTextOutline, walletOutline, cubeOutline, timeOutline,
      storefrontOutline, checkmarkOutline, checkmarkCircleOutline,
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
 
  /* ── Progress stepper helpers ── */
 
  private currentStepIndex(): number {
    if (!this.order) return -1;
    const s = String(this.order.status);
    const idx = this.stepOrder.indexOf(s);
    return idx >= 0 ? idx : parseInt(s, 10);
  }
 
  isStepDone(key: string): boolean {
    const cur = this.currentStepIndex();
    return cur > this.stepOrder.indexOf(key);
  }
 
  isStepActive(key: string): boolean {
    const cur = this.currentStepIndex();
    return cur === this.stepOrder.indexOf(key);
  }
 
  /* ── Status display helpers ── */
 
  getStatusLabel(status: string | number): string {
    const s = String(status);
    const enumMap: Record<string, string> = {
      '0': 'orders_status.created',
      '1': 'orders_status.draft',
      '2': 'orders_status.payment_pending',
      '3': 'orders_status.pending_confirmation',
      '4': 'orders_status.paid',
      '5': 'orders_status.confirmed',
      '6': 'orders_status.shipped',
      '7': 'orders_status.delivered',
      '8': 'orders_status.completed',
      '9': 'orders_status.canceled',
      '10': 'orders_status.failed',
    };
    const nameMap: Record<string, string> = {
      'CREATED': 'orders_status.created',
      'DRAFF': 'orders_status.draft',
      'PAYMENT_PENDING': 'orders_status.payment_pending',
      'PENDING_CONFIRMATION': 'orders_status.pending_confirmation',
      'PAID': 'orders_status.paid',
      'CONFIRMED': 'orders_status.confirmed',
      'SHIPPED': 'orders_status.shipped',
      'DELIVERED': 'orders_status.delivered',
      'COMPLETED': 'orders_status.completed',
      'CANCELED': 'orders_status.canceled',
      'FAILED': 'orders_status.failed',
    };
    const key = enumMap[s] ?? nameMap[s] ?? 'orders_status.processing';
    return key;
  }
 
  getStatusClass(status: string | number): string {
    const s = String(status);
    if (['PAID','CONFIRMED','DELIVERED','COMPLETED','4','5','7','8'].includes(s)) return 'pill-green';
    if (['CANCELED','FAILED','9','10'].includes(s)) return 'pill-red';
    if (['SHIPPED','6'].includes(s)) return 'pill-blue';
    return 'pill-amber';
  }
 
  getStatusIcon(status: string | number): string {
    const s = String(status);
    if (['DELIVERED','COMPLETED','7','8'].includes(s)) return 'checkmark-circle-outline';
    if (['CANCELED','FAILED','9','10'].includes(s))    return 'close-circle-outline';
    if (['SHIPPED','6'].includes(s))                   return 'cube-outline';
    if (['PAID','CONFIRMED','4','5'].includes(s))      return 'card-outline';
    return 'time-outline';
  }
 
  /* ── Shop delivery status ── */
 
  formatDeliveryStatus(status: ShopDeliveryStatus): string {
    const m: Record<ShopDeliveryStatus, string> = {
      [ShopDeliveryStatus.PENDING]:          'Pending',
      [ShopDeliveryStatus.CONFIRMED]:        'Confirmed',
      [ShopDeliveryStatus.PREPARING]:        'Preparing',
      [ShopDeliveryStatus.READY_FOR_PICKUP]: 'Ready',
      [ShopDeliveryStatus.OUT_FOR_DELIVERY]: 'On the way',
      [ShopDeliveryStatus.DELIVERED]:        'Delivered',
      [ShopDeliveryStatus.FAILED]:           'Failed',
      [ShopDeliveryStatus.CANCELED]:         'Cancelled',
    };
    return m[status] ?? status;
  }
 
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
 
  /* ── Payment ── */
 
  formatPaymentMethod(method: PaymentMethod): string {
    const m: Partial<Record<PaymentMethod, string>> = {
      [PaymentMethod.MTN_MOBILE_MONEY]: 'MTN Mobile Money',
      [PaymentMethod.ORANGE_MONEY]:     'Orange Money',
      [PaymentMethod.CASH]:             'Cash on Delivery',
      [PaymentMethod.STRIPE]:           'Stripe',
    };
    return m[method] ?? String(method).replace(/_/g, ' ');
  }
}