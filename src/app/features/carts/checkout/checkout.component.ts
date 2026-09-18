import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  IonContent, IonIcon, NavController, IonHeader, IonButtons, IonToolbar,
  IonTitle, IonButton, IonSpinner, IonSkeletonText, IonToggle, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AuthService } from '../../../auth/auth.service';
import { Subscription, switchMap } from 'rxjs';
import { UserResponse } from '../../../core/model/response/usersResponse';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../../../core/model/enums/payment-method';
import { OrderRequest } from '../../../core/model/requests/order-request';

import { CartItem } from '../../../core/model/cartItem';
import { Router } from '@angular/router';
import { CustomerRequest } from '../../../core/model/requests/customerRequest';
import { CustomerResponse } from '../../../core/model/response/customer-response';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_TYPE_LABELS, DeliveryType } from '../../../core/model/enums/deliveryType';

import { StripePaymentFormComponent } from '../stripe-payment-form/stripe-payment-form.component';
import {
  arrowBackOutline, arrowForwardOutline, bagOutline, cartOutline,
  locationOutline, cardOutline, alertCircleOutline,
  closeOutline, bagCheckOutline, storefrontOutline,
  bicycleOutline, bagHandleOutline, checkmarkCircle,
  callOutline, homeOutline, businessOutline,
  personOutline, shieldCheckmarkOutline,
  lockClosedOutline, checkmarkCircleOutline, cashOutline
} from 'ionicons/icons';
import { CartService } from 'src/app/core/services/cart.service';
import { CustomCurrencyPipe } from 'src/app/core/services/custom.currency.pipe';
import { CustomerService } from 'src/app/core/services/customer.service';
import { LocationService } from 'src/app/core/services/location.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { Currency } from 'src/app/core/model/enums/currency-type';

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

  // ── Logos des méthodes de paiement ──
  // CASH n'a pas de logo dédié : le template retombe sur une icône.
  readonly paymentLogos: Partial<Record<PaymentMethod, string>> = {
    [PaymentMethod.MTN_MOBILE_MONEY]: 'assets/payments/mtn-momo.png',
    [PaymentMethod.ORANGE_MONEY]:     'assets/payments/orange-money.png',
    [PaymentMethod.STRIPE]:           'assets/payments/stripe.png',
    [PaymentMethod.CASH]:           'assets/payments/cash.png',
  };

  // ── Assistant par étapes ──
  // 1: Articles (récapitulatif du panier)
  // 2: Paiement (méthode de paiement + formulaire Stripe)
  // 3: Client (livraison + coordonnées + compte)
  currentStep = 1;
  totalSteps = 3;

  private step2Fields = ['paymentMethod'];
  private step3Fields = ['deliveryType', 'phoneNumber', 'address', 'city'];

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

  get isLastStep(): boolean { return this.currentStep === this.totalSteps; }

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

  // Le panier est mono-devise (imposé par CartService) : null seulement si le panier est vide.
  getItemCurrency(): Currency | null {
    return this.cartService.getCartCurrency();
  }

  private cartSub!: Subscription;

  constructor() {
    addIcons({
      arrowBackOutline, arrowForwardOutline, bagOutline, cartOutline,
      locationOutline, cardOutline, alertCircleOutline,
      closeOutline, bagCheckOutline, storefrontOutline,
      bicycleOutline, bagHandleOutline, checkmarkCircle,
      callOutline, homeOutline, businessOutline,
      personOutline, shieldCheckmarkOutline,
      lockClosedOutline, checkmarkCircleOutline, cashOutline,
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

  private setError(message: string) {
    this.errorMessage = message;
    this.showToast(message, 'danger');

    setTimeout(() => {
      if (this.errorMessage === message) this.errorMessage = '';
    }, 4000);
  }

  // ─── Navigation de l'assistant ──────────────────────────────

  goNext(): void {
    this.errorMessage = '';

    if (this.currentStep === 1) {
      if (!this.cartItems.length) {
        this.setError('Votre panier est vide.');
        return;
      }
    }

    if (this.currentStep === 2) {
      if (this.isFieldGroupInvalid(this.step2Fields)) {
        this.markFieldGroupTouched(this.step2Fields);
        this.setError('Choisissez une méthode de paiement.');
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  goPrev(): void {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.navCtrl.back();
    }
  }

  isStepDone(step: number): boolean {
    return this.currentStep > step;
  }

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  private isFieldGroupInvalid(fields: string[]): boolean {
    return fields.some(f => this.addressForm.get(f)?.invalid);
  }

  private markFieldGroupTouched(fields: string[]): void {
    fields.forEach(f => this.addressForm.get(f)?.markAsTouched());
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
      if (this.isFieldGroupInvalid(this.step3Fields)) {
        this.currentStep = 3;
      } else if (this.isFieldGroupInvalid(this.step2Fields)) {
        this.currentStep = 2;
      }
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
      currency:        this.getItemCurrency(),  // Le panier est mono-devise (imposé par CartService)
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
        currency:      item.currency,
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
        currency: this.getItemCurrency(),
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

}