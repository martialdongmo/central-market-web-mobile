import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  IonContent, IonIcon, NavController, IonHeader, IonButtons, IonToolbar,
  IonTitle, IonButton, IonSpinner, IonSkeletonText, IonToggle, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AuthService } from '../../auth/auth.service';
import { Subscription, switchMap } from 'rxjs';
import { UserResponse } from '../../model/response/usersResponse';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../../model/enums/payment-method';
import { OrderRequest } from '../../model/requests/order-request';
import { OrdersService } from '../../services/orders.service';
import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { CartItem } from '../../model/cartItem';
import { Router } from '@angular/router';
import { CustomerRequest } from '../../model/requests/customerRequest';
import { CustomerResponse } from '../../model/response/customer-response';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { DELIVERY_TYPE_LABELS, DeliveryType } from '../../model/enums/deliveryType';
import { CustomCurrencyPipe } from '../../services/custom.currency.pipe';
import { PaymentService } from '../../services/payment.service';
import { StripePaymentFormComponent } from '../stripe-payment-form/stripe-payment-form.component';
import {
  arrowBackOutline, bagOutline, cartOutline,
  locationOutline, cardOutline, alertCircleOutline,
  closeOutline, bagCheckOutline, storefrontOutline,
  bicycleOutline, bagHandleOutline, checkmarkCircle,
  callOutline, homeOutline, businessOutline,
  personOutline, shieldCheckmarkOutline,
  lockClosedOutline, checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonIcon, ReactiveFormsModule, IonHeader, IonButtons,
    IonToolbar, IonTitle, IonButton, IonSpinner, IonSkeletonText, IonToggle,
    CustomCurrencyPipe, UpperCasePipe, StripePaymentFormComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {

  public  navCtrl         = inject(NavController);
  private cartService     = inject(CartService);
  private authService     = inject(AuthService);
  private orderService    = inject(OrdersService);
  private customerService = inject(CustomerService);
  private router          = inject(Router);
  private fbuilder        = inject(FormBuilder);
  private locationService = inject(LocationService);
  private paymentService  = inject(PaymentService);
  private toastCtrl       = inject(ToastController);

  user:      UserResponse     | null = null;
  customer:  CustomerResponse | null = null;
  cartItems: CartItem[]              = [];
  totalPrice   = 0;
  isLoading    = false;
  errorMessage = '';
  stripeClientSecret: string = '';

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly deliveryTypes  = Object.values(DeliveryType);

  addressForm = this.fbuilder.group({
    deliveryType:   ['', Validators.required],
    paymentMethod:  ['', Validators.required],
    phoneNumber:    ['', Validators.required],
    address:        ['', Validators.required],
    city:           ['', Validators.required],
    defaultAddress: [false],
  });

  get deliveryTypeCtrl():   FormControl { return this.addressForm.get('deliveryType')   as FormControl; }
  get paymentMethodCtrl():  FormControl { return this.addressForm.get('paymentMethod')  as FormControl; }
  get phoneNumberCtrl():    FormControl { return this.addressForm.get('phoneNumber')    as FormControl; }
  get addressCtrl():        FormControl { return this.addressForm.get('address')        as FormControl; }
  get cityCtrl():           FormControl { return this.addressForm.get('city')           as FormControl; }
  get defaultAddressCtrl(): FormControl { return this.addressForm.get('defaultAddress') as FormControl; }

  paymentLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
  }

  deliveryLabel(type: DeliveryType): string {
    return DELIVERY_TYPE_LABELS[type];
  }

  // ─── Prix (source unique de vérité : CartService) ────────────
  getItemPrice(item: CartItem): number {
    return this.cartService.getItemPrice(item);
  }

  getItemLineTotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  private cartSub!: Subscription;

  constructor() {
    addIcons({
      arrowBackOutline, bagOutline, cartOutline,
      locationOutline, cardOutline, alertCircleOutline,
      closeOutline, bagCheckOutline, storefrontOutline,
      bicycleOutline, bagHandleOutline, checkmarkCircle,
      callOutline, homeOutline, businessOutline,
      personOutline, shieldCheckmarkOutline,
      lockClosedOutline, checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    this.locationService.getCurrentLocation();
    this.loadUser();

    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems  = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  loadUser() {
    this.authService.me().subscribe({
      next: (user) => { this.user = user; },
      error: (err) => console.error(err)
    });
  }

  // ─── Toast + bandeau d'erreur ────────────────────────────────
  private async showToast(message: string, color: 'danger' | 'success' | 'warning' = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      mode: 'ios',
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }

  private setError(message: string) {
    this.errorMessage = message;
    this.showToast(message, 'danger');

    setTimeout(() => {
      if (this.errorMessage === message) this.errorMessage = '';
    }, 4000);
  }

  // ─── Flux principal du checkout ──────────────────────────────
  onConfirmation(): void {

    if (!this.user) {
      this.setError('Utilisateur non chargé. Veuillez rafraîchir la page.');
      return;
    }

    if (!this.cartItems.length) {
      this.setError('Votre panier est vide.');
      return;
    }

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.customerService
      .saveNewCustomer(this.buildCustomerRequest())
      .pipe(
        switchMap((customer: CustomerResponse) => {
          this.customer = customer;
          const orderRequest = this.buildOrderRequest(customer, this.user!);
          return this.orderService.createNewOrder(orderRequest);
        })
      )
      .subscribe({
        next: order => {
          this.isLoading = false;
          this.showToast('Commande passée avec succès !', 'success');
          this.cartService.clearCart();
          this.router.navigate([`/order-confirmation/${order.id}`]);
        },
        error: err => {
          this.isLoading = false;
          this.setError('Échec de la commande. Veuillez réessayer.');
          console.error('Checkout error:', err);
        }
      });
  }

  // ─── Request builders ─────────────────────────────────────────
  private buildCustomerRequest(): CustomerRequest {
    const { phoneNumber, address, city, defaultAddress } = this.addressForm.getRawValue();

    return {
      userId:                   this.user!.userUuid,
      firstName:                this.user!.firstName,
      lastName:                 this.user!.lastName,
      email:                    this.user!.email,
      phoneNumber:              phoneNumber   ?? '',
      address:                  address       ?? '',
      defaultDeliveryAddressId: this.customer?.defaultDeliveryAddressId ?? '',
      addressRequest: {
        addressLine:    address  ?? '',
        city:           city     ?? '',
        region:         '',
        latitude:       this.locationService.latitude()?.toString() ?? '',
        longitude:      this.locationService.longitude()?.toString() ?? '',
        defaultAddress: defaultAddress ?? false,
        label:          'Home',
        fullName:       this.user!.lastName + ' ' + this.user!.firstName,
      }
    };
  }

  private buildOrderRequest(customer: CustomerResponse, user: UserResponse): OrderRequest {
    const { paymentMethod, deliveryType } = this.addressForm.getRawValue();
    const deliveryAddressId = customer.defaultDeliveryAddressId;

    if (!deliveryAddressId) {
      throw new Error('Customer has no delivery address. Cannot place order.');
    }

    return {
      customerId:        customer.id,
      userId:            user.userUuid,
      deliveryAddressId: customer.defaultDeliveryAddressId,
      paymentMethod:     paymentMethod as PaymentMethod,
      deliveryType:      deliveryType  as DeliveryType,
      note:              '',
      deviceInfo:        navigator.userAgent,
      items: this.cartItems.map(item => ({
        shopId:        item.shopId,
        userUuid:      item.userUuid,
        shopEmail:     item.shopEmail,
        shopName:      item.shopName,
        shopLatitude:  item.shopLatitude,
        shopLongitude: item.shopLongitude,
        productId:     item.productId,
        productName:   item.productName,
        quantity:      item.quantity,
        unitPrice:     this.getItemPrice(item),
        imageUrl:      item.imageUrl,
      }))
    };
  }

  // ─── Stripe ────────────────────────────────────────────────────
  stripeLoading = false;
  stripeError = '';

  onStripeLoading(isLoading: boolean) {
    this.stripeLoading = isLoading;
  }

  onStripePaymentError(error: string) {
    this.stripeError = error;
    this.setError(error);
  }

  onStripePaymentSuccess(paymentMethodId: string) {
    this.showToast('Paiement réussi !', 'success');
    this.stripeClientSecret = '';
  }

  async processStripePayment(orderId: string) {
    if (!this.totalPrice || this.totalPrice <= 0) {
      this.setError('Montant invalide pour le paiement.');
      return;
    }

    this.isLoading = true;

    try {
      const response = await this.paymentService.initiateStripePayment({
        orderId,
        amount: this.totalPrice,
        paymentMethod: 'STRIPE',
        phoneNumber: this.phoneNumberCtrl.value,
        customerId: this.customer?.id ?? '',
        email: this.user?.email ?? '',
        fullName: `${this.user?.firstName} ${this.user?.lastName}`,
        userId: Number(this.user?.userUuid) || 0
      }).toPromise();

      this.stripeClientSecret = response?.clientSecret;

      if (!this.stripeClientSecret) {
        throw new Error('Échec de la création du paiement.');
      }

    } catch (err: any) {
      this.setError(err.message || "Échec de l'initialisation du paiement.");
      this.isLoading = false;
    }
  }
}