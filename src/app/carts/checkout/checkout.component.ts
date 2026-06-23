import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { IonContent, IonIcon, NavController, IonHeader, IonButtons, IonToolbar, IonTitle, IonButton, IonSpinner, IonSkeletonText, IonFooter, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AuthService } from '../../auth/auth.service';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { UserResponse } from '../../model/response/usersResponse';
import { PaymentMethod } from '../../model/enums/payment-method';
import { OrderRequest } from '../../model/requests/order-request';
import { OrderItemRequest } from '../../model/requests/order-tem-request';
import { OrdersService } from '../../services/orders.service';
import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { CartItem } from '../../model/cartItem';
import { Router } from '@angular/router';
import { CustomerRequest } from '../../model/requests/customerRequest';
import { CustomerResponse } from '../../model/response/customer-response';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { DeliveryType } from '../../model/enums/deliveryType';
import { CustomCurrencyPipe } from '../../services/custom.currency.pipe';
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
  imports: [CommonModule, IonContent, IonIcon, ReactiveFormsModule, IonHeader, IonButtons, 
    IonToolbar, IonTitle, IonButton, IonSpinner, IonSkeletonText, IonToggle,
  CustomCurrencyPipe,CommonModule,ReactiveFormsModule, UpperCasePipe,
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
 
  user:      UserResponse     | null = null;
  customer:  CustomerResponse | null = null;
  cartItems: CartItem[]              = [];
  totalPrice   = 0;
  isLoading    = false;
  errorMessage = '';
 
  readonly paymentMethods = Object.values(PaymentMethod);
  readonly deliveryTypes  = Object.values(DeliveryType);
 
  addressForm = this.fbuilder.group({
    deliveryType:   ['', Validators.required],
    paymentMethod:  ['', Validators.required],
    phoneNumber:    ['', Validators.required],
    address:        ['', Validators.required],
    city:           ['', Validators.required],
    defaultAddress: [false],          // optional — no Validators.required on a boolean
  });
 
  // ─── Typed getters (used in template instead of addressForm.get('...')) ──
  get deliveryTypeCtrl():   FormControl { return this.addressForm.get('deliveryType')   as FormControl; }
  get paymentMethodCtrl():  FormControl { return this.addressForm.get('paymentMethod')  as FormControl; }
  get phoneNumberCtrl():    FormControl { return this.addressForm.get('phoneNumber')    as FormControl; }
  get addressCtrl():        FormControl { return this.addressForm.get('address')        as FormControl; }
  get cityCtrl():           FormControl { return this.addressForm.get('city')           as FormControl; }
  get defaultAddressCtrl(): FormControl { return this.addressForm.get('defaultAddress') as FormControl; }
 
  // ─── Icon helper (keeps ternary chains out of the template) ─────
  // Converts enum key to a readable label.
  // MTN_MOBILE_MONEY → Mtn Mobile Money
  // Swap for official branding/icon later without touching anything else.
  paymentLabel(method: string): string {
    return this.enumToLabel(method);
  }
 
  // DELIVERY → Delivery  |  PICKUP → Pickup
  deliveryLabel(type: string): string {
    return this.enumToLabel(type);
  }
 
  // Shared formatter: SNAKE_CASE → Title Case
  private enumToLabel(value: string): string {
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
 
  // ─── Subscription handle ────────────────────────────────────────
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
      next: (user) => {
        console.log(user)
        this.user = user;
       
      },
      error: (err) => console.error(err)
    });
  }
 
  // ─── Main checkout flow ─────────────────────────────────────────
  // Step 1 → save/get customer
  // Step 2 → create order   (switchMap chains them as one stream)
  // Step 3 → navigate to tracking page
  onConfirmation(): void {
 
    if (!this.user) {
      this.errorMessage = 'User not loaded. Please refresh.';
      return;
    }
 
    if (!this.cartItems.length) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }
 
    if (this.addressForm.invalid) {
      console.error('Form is invalid:', this.addressForm.errors);
      this.addressForm.markAllAsTouched();   // reveal all validation errors
      return;
    }
 
    this.isLoading    = true;
    this.errorMessage = '';
    console.log(this.buildCustomerRequest())
 
    this.customerService
      .saveNewCustomer(this.buildCustomerRequest())
      .pipe(
        switchMap((customer: CustomerResponse) => {
          this.customer = customer;

          const orderRequest = this.buildOrderRequest(customer, this.user!);
          console.log(' OrderRequest payload:', JSON.stringify(orderRequest, null, 2));

          return this.orderService.createNewOrder(
            orderRequest
          );
        })
      )
      .subscribe({
        next: order => {
          this.isLoading = false;
          this.cartService.clearCart();
          this.router.navigate([`/order-confirmation/${order.id}`]);
        },
        error: err => {
          this.isLoading    = false;
          this.errorMessage = 'Checkout failed. Please try again.';
          console.error('Checkout error:', err);
        }
      });
  }
 
  // ─── Request builders ───────────────────────────────────────────
 
  private buildCustomerRequest(): CustomerRequest {
    // Read raw form values once — avoids repeated .value accesses
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
        latitude:       this.locationService.latitude(),
        longitude:      this.locationService.longitude(),
        defaultAddress: defaultAddress ?? false,
        label:          'Home',
        fullName: this.user!.lastName + ' ' + this.user!.firstName,

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
        shopId:       item.shopId,
        userUuid:     item.userUuid,
        shopEmail:    item.shopEmail,
        shopName:     item.shopName,
        shopLatitude: item.shopLatitude,
        shopLongitude:item.shopLongitude,
        productId:    item.productId,
        productName:  item.productName,
        quantity:     item.quantity,
        unitPrice:    item.promotionPrice ?? item.price,
        imageUrl:     item.imageUrl,
      }))
    };
  }


}
