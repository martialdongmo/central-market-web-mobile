import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  IonContent, IonIcon, NavController, IonHeader, IonButtons, IonToolbar,
  IonTitle, IonButton, IonSpinner, IonSkeletonText, IonToggle,
} from '@ionic/angular/standalone';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { addIcons } from 'ionicons';
import { AuthService } from '../../auth/auth.service';
import { Subscription, switchMap } from 'rxjs';
import { UserResponse } from '../../model/response/usersResponse';
import { PaymentMethod } from '../../model/enums/payment-method';
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
import { DeliveryType } from '../../model/enums/deliveryType';
import { CustomCurrencyPipe } from '../../services/custom.currency.pipe';
import { PaymentService } from '../../services/payment.service';
import { StripePaymentFormComponent } from '../stripe-payment-form/stripe-payment-form.component';
import { environment } from '../../../environments/environment';
import {
  arrowBackOutline, bagOutline, cartOutline,
  locationOutline, cardOutline, alertCircleOutline,
  closeOutline, bagCheckOutline, storefrontOutline,
  bicycleOutline, bagHandleOutline, checkmarkCircle,
  callOutline, homeOutline, businessOutline,
  personOutline, shieldCheckmarkOutline,
  lockClosedOutline, checkmarkCircleOutline
} from 'ionicons/icons';

type Coordinates = { lat: number; lng: number };

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonIcon, ReactiveFormsModule, IonHeader, IonButtons,
    IonToolbar, IonTitle, IonButton, IonSpinner, IonSkeletonText, IonToggle,
    CustomCurrencyPipe, UpperCasePipe, StripePaymentFormComponent,
    GoogleMap, MapMarker,
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
    defaultAddress: [false],          // optional — no Validators.required on a boolean
  });

  // ─── Typed getters (used in template instead of addressForm.get('...')) ──
  get deliveryTypeCtrl():   FormControl { return this.addressForm.get('deliveryType')   as FormControl; }
  get paymentMethodCtrl():  FormControl { return this.addressForm.get('paymentMethod')  as FormControl; }
  get phoneNumberCtrl():    FormControl { return this.addressForm.get('phoneNumber')    as FormControl; }
  get addressCtrl():        FormControl { return this.addressForm.get('address')        as FormControl; }
  get cityCtrl():           FormControl { return this.addressForm.get('city')           as FormControl; }
  get defaultAddressCtrl(): FormControl { return this.addressForm.get('defaultAddress') as FormControl; }

  // ─── Map state ────────────────────────────────────────────────────
  private readonly defaultMapPosition: Coordinates = { lat: 4.0511, lng: 9.7679 }; // Douala fallback
  mapCenter:     Coordinates = this.defaultMapPosition;
  markerPosition: Coordinates = this.defaultMapPosition;
  mapLoaded = false;
  mapError  = '';

  // ─── Label helpers (keeps ternary chains out of the template) ─────
  // MTN_MOBILE_MONEY → Mtn Mobile Money
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
    this.loadUser();

    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems  = items;
      this.totalPrice = this.cartService.getTotalPrice();
    });

    void this.initializeDeliveryMap();
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  loadUser() {
    this.authService.me().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => console.error(err)
    });
  }

  // ─── Map init & interaction ─────────────────────────────────────
  private async initializeDeliveryMap(): Promise<void> {
    await this.locationService.getCurrentLocation();

    const currentLocation = this.locationService.asNumbers();
    if (currentLocation) {
      this.mapCenter      = currentLocation;
      this.markerPosition = currentLocation;
    }

    this.loadGoogleMapsApi();
  }

  private loadGoogleMapsApi(): void {
    const apiKey = environment.googleMapsApiKey;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      this.mapError = 'Configurez votre clé Google Maps API pour afficher la carte.';
      return;
    }

    const existingScript = document.getElementById('google-maps-api') as HTMLScriptElement | null;
    if (existingScript) {
      if ((window as any).google?.maps) {
        this.mapLoaded = true;
      } else {
        existingScript.addEventListener('load', () => (this.mapLoaded = true), { once: true });
        existingScript.addEventListener(
          'error',
          () => (this.mapError = 'Impossible de charger Google Maps.'),
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.onload  = () => (this.mapLoaded = true);
    script.onerror = () => (this.mapError = 'Impossible de charger Google Maps.');
    document.head.appendChild(script);
  }

  onMapClick(event: any): void {
    const coordinates = this.coordinatesFromMapEvent(event);
    if (coordinates) {
      this.setDeliveryCoordinates(coordinates);
    }
  }

  onMarkerDragEnd(event: any): void {
    const coordinates = this.coordinatesFromMapEvent(event);
    if (coordinates) {
      this.setDeliveryCoordinates(coordinates);
    }
  }

  private coordinatesFromMapEvent(event: any): Coordinates | null {
    if (!event?.latLng) {
      return null;
    }

    const position = typeof event.latLng.toJSON === 'function'
      ? event.latLng.toJSON()
      : { lat: event.latLng.lat(), lng: event.latLng.lng() };

    return typeof position.lat === 'number' && typeof position.lng === 'number'
      ? position
      : null;
  }

  private setDeliveryCoordinates(coordinates: Coordinates): void {
    this.markerPosition = coordinates;
    this.mapCenter       = coordinates;
    this.locationService.setLatitude(coordinates.lat);
    this.locationService.setLongitude(coordinates.lng);
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
        latitude:       this.locationService.latitude()?.toString()  ?? '',
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
      deliveryAddressId: deliveryAddressId,
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
        unitPrice:     item.promotionPrice ?? item.price,
        imageUrl:      item.imageUrl,
      }))
    };
  }

  // ─── Stripe Payment Handlers ─────────────────────────────────────
  stripeLoading = false;
  stripeError = '';

  onStripeLoading(isLoading: boolean) {
    this.stripeLoading = isLoading;
  }

  onStripePaymentError(error: string) {
    this.stripeError = error;
    this.errorMessage = error;
  }

  onStripePaymentSuccess(paymentMethodId: string) {
    // Payment successful - the order is already created
    // The parent component handles navigation
    console.log('Stripe payment successful:', paymentMethodId);
    this.stripeClientSecret = '';
  }

  // ─── Stripe Payment Flow ───────────────────────────────────────────
  async processStripePayment(orderId: string) {
    if (!this.totalPrice || this.totalPrice <= 0) {
      this.errorMessage = 'Invalid amount for payment';
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

      this.stripeClientSecret = response?.clientSecret ?? '';

      if (!this.stripeClientSecret) {
        throw new Error('Failed to create payment intent');
      }

    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to initialize payment';
      this.isLoading = false;
    }
  }
}