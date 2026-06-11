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
  timeOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { OrdersService } from 'src/app/services/orders.service';
import { CustomerOrderDetailResponse } from 'src/app/model/response/orders/customer.order.detail.response';
import { CustomCurrencyPipe } from "../../services/custom-currency-pipe";

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, DatePipe, CurrencyPipe, CustomCurrencyPipe],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: CustomerOrderDetailResponse | null = null;
  isLoading = false;
  
  private subs: Subscription[] = [];
  
  private route = inject(ActivatedRoute);
  private orderService = inject(OrdersService);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({ 
      arrowBackOutline, 
      locationOutline, 
      callOutline, 
      personOutline, 
      documentTextOutline, 
      walletOutline,
      cubeOutline,
      timeOutline
    });
  }

  ngOnInit() {
    // 1. Capture the order tracking ID from the route path parameter
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.getDetails(orderId);
    } else {
      console.error('No order tracking ID supplied in the route context.');
      this.goBack();
    }
  }

  ngOnDestroy() {
    // 2. Prevent memory leaks by safely closing the subscription stream
    this.subs.forEach(sub => sub.unsubscribe());
  }

  getDetails(id: string) {
    this.isLoading = true;
    const detailSub = this.orderService.getCustomerOrderDetail(id).subscribe({
      next: (response: CustomerOrderDetailResponse) => {
        this.order = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching deep order detail records:', err);
        this.isLoading = false;
      }
    });

    this.subs.push(detailSub);
  }

  getStatusLabel(status: string | number): string {
    const s = String(status);
    const labels: { [key: string]: string } = {
      'CREATED': 'Created', '0': 'Created',
      'DRAFF': 'Draft', '1': 'Draft',
      'PAYMENT_PENDING': 'Payment Pending', '2': 'Payment Pending',
      'PENDING_CONFIRMATION': 'Pending Confirmation', '3': 'Pending Confirmation',
      'PAID': 'Paid', '4': 'Paid',
      'CONFIRMED': 'Confirmed', '5': 'Confirmed',
      'SHIPPED': 'Shipped', '6': 'Shipped',
      'DELIVERED': 'Delivered', '7': 'Delivered',
      'COMPLETED': 'Completed', '8': 'Completed',
      'CANCELED': 'Canceled', '9': 'Canceled',
      'FAILED': 'Failed', '10': 'Failed'
    };
    return labels[s] || 'Processing';
  }

  getStatusClass(status: string | number): string {
    const s = String(status);
    if (['PAID', 'CONFIRMED', 'DELIVERED', 'COMPLETED', '4', '5', '7', '8'].includes(s)) {
      return 'bg-green-50 text-green-600 border-green-200';
    }
    if (['CANCELED', 'FAILED', '9', '10'].includes(s)) {
      return 'bg-red-50 text-red-600 border-red-200';
    }
    if (['CREATED', 'DRAFF', '0', '1'].includes(s)) {
      return 'bg-blue-50 text-blue-600 border-blue-200';
    }
    return 'bg-amber-50 text-amber-600 border-amber-200';
  }

  goBack() {
    this.navCtrl.back();
  }
}