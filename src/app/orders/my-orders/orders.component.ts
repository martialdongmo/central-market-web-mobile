import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  bagHandleOutline,
  bicycleOutline,
  storefrontOutline,
  cubeOutline,
  cardOutline,
  timeOutline,
  chevronForwardOutline,
  refreshOutline,
  searchOutline,
  closeCircleOutline,
  filterOutline,
  checkmarkCircleOutline,
  closeCircle,
  ellipseOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { OrdersService } from 'src/app/services/orders.service';
import { PageResponse } from 'src/app/model/response/orders/page.response';
import { OrderSummaryResponse } from 'src/app/model/response/orders/orderSummaryResponse';
import { OrderStatus } from 'src/app/model/response/orders/orderStatus';
import { DeliveryType } from 'src/app/model/enums/deliveryType';
import { PaymentMethod } from 'src/app/model/enums/payment-method';

interface StatusTab  { label: string; value: OrderStatus | null; icon: string; }
interface DateRange  { label: string; key: string; from?: string; to?: string; }

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner, DatePipe, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {

  orders: PageResponse<OrderSummaryResponse> | null = null;
  filteredOrders: OrderSummaryResponse[] = [];

  isLoading = false;
  showSearch = false;
  searchQuery = '';
  activeStatus: OrderStatus | null = null;
  activeDateRange = 'all';
  currentPage = 0;

  /* ── Tab definitions (with icons) ── */
  readonly statusTabs: StatusTab[] = [
    { label: 'All',       value: null,                             icon: 'list-outline'              },
    { label: 'Pending',   value: OrderStatus.PENDING_CONFIRMATION, icon: 'time-outline'              },
    { label: 'Paid',      value: OrderStatus.PAID,                 icon: 'card-outline'              },
    { label: 'Shipped',   value: OrderStatus.SHIPPED,              icon: 'bicycle-outline'           },
    { label: 'Delivered', value: OrderStatus.DELIVERED,            icon: 'checkmark-circle-outline'  },
    { label: 'Cancelled', value: OrderStatus.CANCELED,             icon: 'close-circle-outline'      },
  ];

  readonly dateRanges: DateRange[] = [
    { label: 'All time', key: 'all' },
    { label: 'Today',    key: 'today'   },
    { label: 'This week',key: 'week'    },
    { label: 'This month', key: 'month' },
    { label: 'Last 3 months', key: '3months' },
  ];

  private sub!: Subscription;
  private orderService = inject(OrdersService);

  constructor(public navCtrl: NavController) {
    addIcons({
      arrowBackOutline, bagHandleOutline, bicycleOutline, storefrontOutline,
      cubeOutline, cardOutline, timeOutline, chevronForwardOutline,
      refreshOutline, searchOutline, closeCircleOutline, filterOutline,
      checkmarkCircleOutline, closeCircle, ellipseOutline, alertCircleOutline,
    });
  }

  ngOnInit(): void { this.getMyOrders(); }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  /* ── Data fetching ── */

  getMyOrders(page = 0): void {
    this.isLoading = true;
    const range = this.dateRanges.find(r => r.key === this.activeDateRange);

    this.sub = this.orderService
      .getCustomerOrders(page, 20, this.activeStatus ?? undefined, range?.from, range?.to)
      .subscribe({
        next: (res) => {
          this.orders = res;
          this.applyClientFilter();
          this.isLoading = false;
        },
        error: (err) => { console.error(err); this.isLoading = false; },
      });
  }

  loadMore(): void {
    this.currentPage++;
    this.getMyOrders(this.currentPage);
  }

  /* ── Filters ── */

  filterByStatus(status: OrderStatus | null): void {
    this.activeStatus = status;
    this.currentPage = 0;
    this.getMyOrders(0);
  }

  filterByDate(key: string): void {
    this.activeDateRange = key;
    this.currentPage = 0;
    this.getMyOrders(0);
  }

  /* ── Search (client-side on reference) ── */

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.clearSearch();
  }

  onSearch(): void { this.applyClientFilter(); }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyClientFilter();
  }

  private applyClientFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredOrders = q
      ? (this.orders?.content ?? []).filter(o => o.reference.toLowerCase().includes(q))
      : (this.orders?.content ?? []);
  }

  /* ── Navigation ── */

  openOrder(id: string): void { this.navCtrl.navigateForward(`/order-tracking/${id}`); }
  goToCatalog(): void { this.navCtrl.navigateRoot('/catalog'); }

  /* ── Display helpers ── */

  formatStatus(status: OrderStatus): string {
    const m: Record<string, string> = {
      CREATED: 'Created', DRAFF: 'Draft',
      PAYMENT_PENDING: 'Pay Pending', PENDING_CONFIRMATION: 'Confirming',
      PAID: 'Paid', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped',
      DELIVERED: 'Delivered', COMPLETED: 'Completed',
      CANCELED: 'Cancelled', FAILED: 'Failed',
    };
    return m[String(status)] ?? String(status);
  }

  /** Returns accent class (color of left bar) */
  getAccentClass(status: OrderStatus): string {
    const s = String(status);
    if (['DELIVERED','COMPLETED'].includes(s)) return 'green';
    if (['CANCELED','FAILED'].includes(s))     return 'red';
    if (['SHIPPED'].includes(s))               return 'blue';
    if (['PAID','CONFIRMED'].includes(s))      return 'blue';
    if (['PAYMENT_PENDING','PENDING_CONFIRMATION'].includes(s)) return 'amber';
    return 'gray';
  }

  /** Returns status pill CSS class */
  getStatusClass(status: OrderStatus): string {
    const s = String(status);
    if (['DELIVERED','COMPLETED'].includes(s))                  return 's-green';
    if (['CANCELED','FAILED'].includes(s))                      return 's-red';
    if (['SHIPPED','PAID','CONFIRMED'].includes(s))             return 's-blue';
    if (['PAYMENT_PENDING','PENDING_CONFIRMATION'].includes(s)) return 's-amber';
    return 's-gray';
  }

  /** Returns the right ion-icon name for the status */
  getStatusIcon(status: OrderStatus): string {
    const s = String(status);
    if (['DELIVERED','COMPLETED'].includes(s)) return 'checkmark-circle-outline';
    if (['CANCELED','FAILED'].includes(s))     return 'close-circle-outline';
    if (['SHIPPED'].includes(s))               return 'bicycle-outline';
    if (['PAID','CONFIRMED'].includes(s))      return 'card-outline';
    return 'time-outline';
  }

  formatDelivery(type: DeliveryType): string {
    return type === DeliveryType.DELIVERY ? 'Delivery' : 'Pickup';
  }

  formatPayment(method: PaymentMethod): string {
    const m: Partial<Record<PaymentMethod, string>> = {
      [PaymentMethod.MTN_MOBILE_MONEY]: 'MTN MoMo',
      [PaymentMethod.ORANGE_MONEY]:     'Orange Money',
      [PaymentMethod.CASH]:             'Cash',
      [PaymentMethod.PAYPAL]:           'PayPal',
      [PaymentMethod.CREDIT_CARD]:      'Card',
      [PaymentMethod.STRIPE]:           'Stripe',
    };
    return m[method] ?? String(method).replace(/_/g, ' ');
  }

  getPaymentClass(method: PaymentMethod): string {
    if (method === PaymentMethod.MTN_MOBILE_MONEY) return 'pay-mtn';
    if (method === PaymentMethod.ORANGE_MONEY)     return 'pay-orange';
    if (method === PaymentMethod.CASH)             return 'pay-cash';
    if ([PaymentMethod.CREDIT_CARD, PaymentMethod.STRIPE].includes(method)) return 'pay-card';
    return 'pay-other';
  }
}