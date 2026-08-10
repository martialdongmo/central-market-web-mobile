import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentMethod } from 'src/app/model/enums/payment-method';
import { PaymentRequest } from 'src/app/model/requests/paymentRequest';
import { DeliveryAddressResponse } from 'src/app/model/response/deliveryAddressResponse';
import { OrderResponse } from 'src/app/model/response/orderResponse';
import { CustomerService } from 'src/app/services/customer.service';
import { OrdersService } from 'src/app/services/orders.service';
import { PaymentService } from 'src/app/services/payment.service';
import { IonContent, IonSpinner, IonBadge, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, IonSkeletonText } from "@ionic/angular/standalone";
import { AuthService } from 'src/app/auth/auth.service';
import { UserResponse } from 'src/app/model/response/usersResponse';
import { CustomCurrencyPipe } from "../../services/custom.currency.pipe";
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkOutline, receiptOutline, bagCheckOutline, bicycleOutline, bagHandleOutline, walletOutline, locationOutline, personOutline, callOutline, homeOutline, businessOutline, shieldCheckmarkOutline, lockClosedOutline, phonePortraitOutline, cashOutline, storefrontOutline, alertCircleOutline, timeOutline } from 'ionicons/icons';
import {  TitleCasePipe } from '@angular/common';
import { timer, switchMap, takeWhile, firstValueFrom } from 'rxjs';
import { Stripe, PaymentSheetEventsEnum } from '@capacitor-community/stripe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-confirmation-order',
  templateUrl: './confirmation-order.component.html',
  styleUrls: ['./confirmation-order.component.scss'],
  imports: [IonContent, IonSpinner, IonBadge, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonButtons, CustomCurrencyPipe, IonSkeletonText,
    TitleCasePipe, RouterLink],
})
export class ConfirmationOrderComponent implements OnInit {

  private orderService = inject(OrdersService);
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private customerSerice = inject(CustomerService);
  private authService = inject(AuthService);
  private router = inject(Router);

  order: OrderResponse | null = null;
  user: UserResponse | null = null;

  private orderId: string = '';

  phoneMessageCode: string = '';
  errorMessage: string;
  loading: boolean;
  isPaying: boolean;
  customerAddress: DeliveryAddressResponse | null = null;
  private destroyRef = inject(DestroyRef);
  isConfirming: boolean = false;

  constructor() {
    addIcons({
      arrowBackOutline, checkmarkOutline, receiptOutline,
      bagCheckOutline, bicycleOutline, bagHandleOutline,
      walletOutline, locationOutline, personOutline,
      callOutline, homeOutline, businessOutline,
      shieldCheckmarkOutline, lockClosedOutline,
      phonePortraitOutline, cashOutline, storefrontOutline,
      alertCircleOutline, timeOutline
    });
  }

  ngOnInit() {
    this.initOrderFromRoute();
    this.loadUser();
  }

  private initOrderFromRoute(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';

    if (!this.orderId) {
      this.errorMessage = 'Invalid order ID';
      return;
    }

    this.getOrder(this.orderId);
  }

  getOrder(orderId: string) {

    this.loading = true;

    this.orderService.getOrder(orderId).subscribe({
      next: (response) => {
        this.order = response;
        this.loading = false;

        // IMPORTANT: load address AFTER order is available
        if (this.order.deliveryAddressId) {
          this.getCustomerAddress(this.order.deliveryAddressId);
        }
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
        this.errorMessage = 'Unable to load order';
        this.loading = false;
      }
    });
  }


  // we can the customer phone number from the order details or customer profile, but for now we will use a placeholder
  getCustomerAddress(deliveryAddressId: string): void {
    this.customerSerice.getCustomerAddress(deliveryAddressId).subscribe({
      next: (response) => {
        console.log('Customer address:', response);
        // we can display the address in the template using a property or directly from the order details if included
        this.customerAddress = response;
      },
      error: (error) => {
        console.error('Error fetching customer address:', error);
        this.errorMessage = 'Unable to load address';
      }
    });

  }

  loadUser() {
    this.authService.me().subscribe({
      next: (user) => {
        console.log(user)
        this.user = user;

      },
      error: (err) => console.error(err)
    });
  }


  private createPaymentRequest(): PaymentRequest | null {

    if (!this.order || !this.customerAddress) return null;

    return {
      orderId: this.order?.id ?? '',
      amount: this.order?.totalAmount ?? 0,
      paymentMethod: this.order?.paymentMethod,
      phoneNumber: this.customerAddress?.phoneNumber ?? '',
      email: this.user?.email ?? '',
      fullName: this.user ? `${this.user.firstName} ${this.user.lastName}` : '',
      customerId: this.customerAddress?.id ?? '',
      reference: this.order?.reference ?? '',
      userId: this.user ? this.user.id : 0
    };
  }



  onConfirmPayment(): void {
    this.confirmPayment();
  }

  // This method check payment method and call the appropriate service method to initiate payment
  public confirmPayment(): void {
    if (!this.order) {
      this.errorMessage = 'Order not loaded';
      return;
    }

    const request = this.createPaymentRequest();

    if (!request) {
      this.errorMessage = 'Missing payment data';
      return;
    }

    this.isPaying = true;
    this.errorMessage = '';

    switch (this.order.paymentMethod) {
      case PaymentMethod.MTN_MOBILE_MONEY:
        this.createMTNPayment(request);
        break;

      case PaymentMethod.ORANGE_MONEY:
        this.createORANGEMONEYPayment(request);
        break;

      case PaymentMethod.CASH:
        this.createCASHPayment(request);
        break;

      case PaymentMethod.STRIPE:
        this.createSTRIPEPayment(request);
        break;

      default:
        this.errorMessage = 'Unsupported payment method';
        this.isPaying = false;
    }
  }

  createMTNPayment(request: PaymentRequest): void {
    if (!this.order) {
      this.errorMessage = 'Order not loaded';
      return;
    }

    if (!request) {
      this.errorMessage = 'Missing payment data';
      return;
    }

    this.isPaying = true;
    this.errorMessage = '';
    this.phoneMessageCode = 'Please check your phone for the confirmation code.'
    this.paymentService.initiateMtnPayment(request).subscribe({
      next: (response) => {
        console.log('Payment started:', response);
        this.isPaying = false;
        this.router.navigate([`/payment-success/${this.order.id}`]);
      },
      error: (err) => {
        console.error('Payment error:', err);
        this.errorMessage = 'Payment failed. Try again.';
        this.isPaying = false;
        this.phoneMessageCode = ''
      }
    });
  }


  // ORANGE MONEY 
  createORANGEMONEYPayment(request: PaymentRequest): void {
    console.log("ORANGE MONEY SELECTED");
    console.log(request)
    if (!this.order) {
      this.errorMessage = 'Order not loaded';
      return;
    }

    if (!request) {
      this.errorMessage = 'Missing payment data';
      return;
    }

    this.isPaying = true;
    this.errorMessage = '';
    this.phoneMessageCode = 'Please check your phone for the confirmation code.'
    this.paymentService.initiateOMPayment(request).subscribe({
      next: (response) => {
        console.log('Payment started:', response);
        this.isPaying = false;
        this.router.navigate([`/payment-success/${this.order.id}`]);
      },
      error: (err) => {
        console.error('Payment error:', err);
        this.errorMessage = 'Payment failed. Try again.';
        this.isPaying = false;
        this.phoneMessageCode = ''
      }
    });
  }


  // STRIP PAYMENT 
  createSTRIPEPayment(request: PaymentRequest): void {

  if (!this.order) { this.errorMessage = 'Order not loaded'; return; }
  if (!request) { this.errorMessage = 'Missing payment data'; return; }

  this.isPaying = true;
  this.errorMessage = '';

  if (Capacitor.isNativePlatform()) {

    // ✅ APK — Payment Sheet + polling confirmation
    this.paymentService.initiateStripePayment(request).subscribe({
      next: async (response) => {
        try {
          await Stripe.createPaymentSheet({
            paymentIntentClientSecret: response.clientSecret,
            merchantDisplayName: 'BIS GroupinG'
          });

          const result = await Stripe.presentPaymentSheet();
          this.isPaying = false;

          if (result.paymentResult === PaymentSheetEventsEnum.Completed) {
            // ✅ Payment Sheet confirmé — on poll le backend pour le statut final
            this.waitForStripeConfirmation(response.orderId);

          } else if (result.paymentResult === PaymentSheetEventsEnum.Canceled) {
            this.errorMessage = 'Paiement annulé.';

          } else {
            this.errorMessage = 'Paiement échoué. Réessayez.';
          }

        } catch (err) {
          console.error('[Stripe Native] Payment sheet error:', err);
          this.errorMessage = 'Payment failed. Try again.';
          this.isPaying = false;
        }
      },
      error: (err) => {
        console.error('[Stripe Native] Intent error:', err);
        this.errorMessage = 'Payment failed. Try again.';
        this.isPaying = false;
      }
    });

  } else {

    // ✅ Web — Redirect Stripe Checkout
    this.paymentService.initiateStripeCheckout(request).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('[Stripe Web] Checkout error:', err);
        this.errorMessage = 'Payment failed. Try again.';
        this.isPaying = false;
      }
    });
  }
}

private waitForStripeConfirmation(referenceId: string): void {
  this.isConfirming = true;

  const maxAttempts = 15;
  let attempts = 0;

  timer(0, 2000).pipe(
    switchMap(() => this.paymentService.getPaymentStatus(referenceId)),
    takeWhile(res => {
      attempts++;
      const stillPending = res.status === 'PENDING';
      return stillPending && attempts < maxAttempts;
    }, true),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe({
    next: (res) => {
      if (res.status === 'SUCCESS') {
        this.isConfirming = false;
        this.router.navigate([`/payment-success/${this.order!.id}`]);

      } else if (res.status === 'FAILED') {
        this.isConfirming = false;
        this.errorMessage = 'Le paiement a été refusé par la banque.';

      } else if (attempts >= maxAttempts) {
        this.isConfirming = false;
        this.errorMessage = 'Paiement en cours de confirmation. Vérifiez votre commande dans quelques instants.';
      }
    },
    error: (err) => {
      console.error('[Stripe] Status polling error:', err);
      this.isConfirming = false;
      this.errorMessage = 'Erreur de connexion au serveur.';
    }
  });
}
  

  createCASHPayment(request: PaymentRequest): void {
    if (!this.order) {
      this.errorMessage = 'Order not loaded';
      return;
    }


    if (!request) {
      this.errorMessage = 'Missing payment data';
      return;
    }

    this.isPaying = true;
    this.errorMessage = '';

    this.paymentService.createCASHPayment(request).subscribe({
      next: (response) => {
        console.log('Payment started:', response);
        this.isPaying = false;
        this.router.navigate([`/payment-success/${this.order.id}`]);
      },
      error: (err) => {
        console.error('Payment error:', err);
        this.errorMessage = 'Payment failed. Try again.';
        this.isPaying = false;
      }
    });
  }
  onGoBack(): void {
    // go bact the catalog complete payments
    this.router.navigate(['/catalog']);

  }

  getPaymentMeta(method: PaymentMethod) {
    switch (method) {
      case PaymentMethod.MTN_MOBILE_MONEY:
        return {
          label: 'MTN Mobile Money',
          logo: 'assets/payments/mtn-momo.png',
          color: 'warning'
        };

      case PaymentMethod.ORANGE_MONEY:
        return {
          label: 'Orange Money',
          logo: 'assets/payments/orange-money.png',
          color: 'danger'
        };


      case PaymentMethod.STRIPE:
        return {
          label: 'Stripe payment',
          logo: 'assets/payments/stripe.png',
          color: 'primary'
        };

      case PaymentMethod.CASH:
        return {
          label: 'Cash on Delivery',
          logo: 'assets/payments/cash.png',
          color: 'medium'
        };



      default:
        return {
          label: method,
          logo: 'assets/payments/default.png',
          color: 'primary'
        };
    }
  }


}
