import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

// ══════════════════════════════════════════════════════
//  ENUMS  (from API contract)
// ══════════════════════════════════════════════════════
export const OrderStatus = {
  CREATED:              'CREATED',
  DRAFF:                'DRAFF',
  PAYMENT_PENDING:      'PAYMENT_PENDING',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  PAID:                 'PAID',
  CONFIRMED:            'CONFIRMED',
  SHIPPED:              'SHIPPED',
  DELIVERED:            'DELIVERED',
  COMPLETED:            'COMPLETED',
  CANCELED:             'CANCELED',
  FAILED:               'FAILED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  CASH:             'CASH',
  ORANGE_MONEY:     'ORANGE_MONEY',
  MTN_MOBILE_MONEY: 'MTN_MOBILE_MONEY',
  PAYPAL:           'PAYPAL',
  CREDIT_CARD:      'CREDIT_CARD',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const DeliveryType = {
  DELIVERY: 'DELIVERY',
  PICKUP:   'PICKUP',
} as const;
export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];

// ══════════════════════════════════════════════════════
//  MODELS  (from API contract)
// ══════════════════════════════════════════════════════

/** Used in paginated list screens */
export interface OrderSummaryResponse {
  id:            string;
  reference:     string;
  status:        OrderStatus;
  totalAmount:   number;
  deliveryFee:   number;
  paymentMethod: PaymentMethod;
  deliveryType:  DeliveryType;
  itemCount:     number;
  createdAt:     string;
}

/** Single item inside an order */
export interface OrderItemResponse {
  productId:       string;
  productName:     string;
  imageUrl:        string;
  priceAtPurchase: number;
  quantity:        number;
  shopId:          string;
  shopName:        string;
}

/** Full detail — returns ALL products across all shops */
export interface CustomerOrderDetailResponse {
  id:                  string;
  reference:           string;
  status:              OrderStatus;
  subtotalAmount:      number;
  deliveryFee:         number;
  totalAmount:         number;
  paymentMethod:       PaymentMethod;
  deliveryType:        DeliveryType;
  deliveryAddressId:   string;
  addressLine:         string;
  customerFullName:    string;
  customerPhoneNumber: string;
  note:                string;
  createdAt:           string;
  items:               OrderItemResponse[];
}

/** Generic pagination wrapper */
export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  first:         boolean;
  last:          boolean;
}

// ══════════════════════════════════════════════════════
//  LOCAL TRACKING  (for real-time UI simulation)
// ══════════════════════════════════════════════════════
export type TrackingStatus = 'confirmed' | 'preparing' | 'shipped' | 'delivered';

export interface OrderStep {
  status:      TrackingStatus;
  label:       string;
  description: string;
  time?:       string;
  done:        boolean;
  active:      boolean;
}

// ══════════════════════════════════════════════════════
//  SERVICE
// ══════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class CustomerOrderService {

  private readonly base = `${environment.orderEndpoint}`;
  private http = inject(HttpClient);

  private emptyPage: PageResponse<OrderSummaryResponse> = {
    content: [], page: 0, size: 20,
    totalElements: 0, totalPages: 0, first: true, last: true,
  };

  // ── LIST ──────────────────────────────────────────
  /**
   * GET /api/v1/bis/orders/customer
   * Returns paginated orders for the authenticated customer.
   */
  getMyOrders(params?: {
    page?:   number;
    size?:   number;
    status?: OrderStatus;
    from?:   string;   // yyyy-MM-dd
    to?:     string;   // yyyy-MM-dd
  }): Observable<PageResponse<OrderSummaryResponse>> {
    const p = this.buildParams(params);
    return this.http
      .get<PageResponse<OrderSummaryResponse>>(`${this.base}/customer`, { params: p })
      .pipe(catchError(() => of(this.emptyPage)));
  }

  // ── DETAIL ────────────────────────────────────────
  /**
   * GET /api/v1/bis/orders/customer/:orderId
   * Returns full order detail with ALL items (across all shops).
   */
  getOrderDetail(orderId: string): Observable<CustomerOrderDetailResponse | undefined> {
    return this.http
      .get<CustomerOrderDetailResponse>(`${this.base}/customer/${orderId}`)
      .pipe(catchError(() => of(undefined)));
  }

  // ── CANCEL ────────────────────────────────────────
  /**
   * PATCH /api/v1/bis/orders/:orderId/cancel
   * Allows the customer to cancel their order.
   */
  cancelOrder(orderId: string): Observable<void> {
    return this.http
      .patch<void>(`${this.base}/${orderId}/cancel`, {})
      .pipe(catchError(() => of(void 0)));
  }

  // ══════════════════════════════════════════════════
  //  LOCAL TRACKING HELPERS
  //  Map API status → local TrackingStatus for UI
  // ══════════════════════════════════════════════════

  /** Maps API OrderStatus to a local TrackingStatus for the stepper UI */
  toTrackingStatus(status: OrderStatus): TrackingStatus {
    const map: { [key: string]: TrackingStatus } = {
      CREATED:              'confirmed',
      DRAFF:                'confirmed',
      PAYMENT_PENDING:      'confirmed',
      PENDING_CONFIRMATION: 'confirmed',
      PAID:                 'confirmed',
      CONFIRMED:            'confirmed',
      SHIPPED:              'shipped',
      DELIVERED:            'delivered',
      COMPLETED:            'delivered',
      CANCELED:             'confirmed',
      FAILED:               'confirmed',
    };
    return map[status as string] ?? 'confirmed';
  }

  /** Builds the tracking steps array for the stepper UI */
  buildTrackingSteps(status: OrderStatus, createdAt: string): OrderStep[] {
    const trackingStatus = this.toTrackingStatus(status);
    const statuses: TrackingStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(trackingStatus);
    const orderDate = new Date(createdAt);

    const definitions: { status: TrackingStatus; label: string; description: string }[] = [
      { status: 'confirmed',  label: 'Commande confirmée', description: 'Votre commande a été reçue et validée.' },
      { status: 'preparing',  label: 'En préparation',     description: 'Votre commande est en cours de préparation par le vendeur.' },
      { status: 'shipped',    label: 'En livraison',       description: 'Votre colis est en route ! Le livreur arrive bientôt.' },
      { status: 'delivered',  label: 'Livré',              description: 'Votre commande a été livrée avec succès.' },
    ];

    return definitions.map((def, i) => ({
      ...def,
      done:   i < currentIdx,
      active: i === currentIdx,
      time:   i <= currentIdx
        ? this.formatTime(new Date(orderDate.getTime() + i * 300000))
        : undefined,
    }));
  }

  /** Returns a human-readable estimated delivery string */
  getEstimatedDelivery(createdAt: string): string {
    const d = new Date(createdAt);
    d.setMinutes(d.getMinutes() + 30);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // ── PRIVATE ───────────────────────────────────────
  private buildParams(params?: {
    page?: number; size?: number;
    status?: OrderStatus; from?: string; to?: string;
  }): HttpParams {
    let p = new HttpParams();
    if (params?.page   != null) p = p.set('page',   params.page);
    if (params?.size   != null) p = p.set('size',   params.size);
    if (params?.status)         p = p.set('status', params.status);
    if (params?.from)           p = p.set('from',   params.from);
    if (params?.to)             p = p.set('to',     params.to);
    return p;
  }

  private formatTime(d: Date): string {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}