import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonContent, IonIcon, NavController, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, bagHandleOutline, locationOutline, chevronForwardOutline, walletOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs'; // 1. Import Subscription
import { OrdersService } from 'src/app/services/orders.service';
import { PageResponse } from '../../model/response/orders/page.response';
import { OrderSummaryResponse } from 'src/app/model/response/orders/orderSummaryResponse';
import { CustomCurrencyPipe } from "../../services/custom-currency-pipe";

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner, DatePipe, CustomCurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: PageResponse<OrderSummaryResponse> | null = null;
  isLoading = false;

  // 2. Clear box array to track our active order request stream
  private subs: Subscription[] = [];

  private orderService = inject(OrdersService);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({ arrowBackOutline, bagHandleOutline, locationOutline, chevronForwardOutline, walletOutline });
  }

  ngOnInit() {
    this.getMyOrder();
  }

  // 3. Clean up the box manually when user exits the orders list screen
  ngOnDestroy() { 
    this.subs.forEach(sub => sub.unsubscribe()); 
  }

  getMyOrder() {
    this.isLoading = true;

    // 4. Save the active connection reference
    const orderSub = this.orderService.getCustomerOrders(0, 20).subscribe({ 
      next: (response: PageResponse<OrderSummaryResponse>) => {
        this.orders = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.isLoading = false;
      }
    });

    // 5. Securely push the connection into the management array
    this.subs.push(orderSub);
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

  openOrder(id: string) { 
    this.navCtrl.navigateForward(`/order-tracking/${id}`); 
  }
  
  goBack() { 
    this.navCtrl.back(); 
  }
  
  goToCatalog() { 
    this.navCtrl.navigateRoot('/catalog'); 
  }
}