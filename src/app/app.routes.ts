import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { ConfirmationOrderComponent } from './features/orders/confirmation-order/confirmation-order.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { CatalogComponent } from './features/catalog-product/catalog/catalog.component';
import { PaymentSuccessComponent } from './features/payments/payment-success/payment-success.component';
import { OrdersComponent } from './features/orders/my-orders/orders.component';
import { OrderTrackingComponent } from './features/orders/order-tracking/order-tracking.component';
import { TermsServiceComponent } from './shared/terms-service/terms-service.component';
import { PravacyPolicyComponent } from './shared/pravacy-policy/pravacy-policy.component';
import { HelpSupportComponent } from './shared/help-support/help-support.component';
import { PaymentPolicyComponent } from './shared/payment-policy/payment-policy.component';
import { RegisterDriverComponent } from './driver/register-driver/register-driver.component';
import { ScanOrderComponent } from './driver/scan-order/scan-order.component';
import { CancelPaymentComponent } from './features/payments/cancel-payment/cancel-payment.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [

  { path: '', redirectTo: 'catalog', pathMatch: 'full' },

  // ════════════════════════════════════════════════════════════
  // PAGES SANS FOOTER
  // login, register, callback, otp — pas de tab bar ici
  // ════════════════════════════════════════════════════════════

  {
    path: 'secure-app',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'verify-otp',
    component: VerifyOtpComponent,
    title: 'Verify OTP',
  },
  {
    path: 'callback',
    component: CallbackComponent,
  },
  {
    path: 'change-password',
    component: ResetPasswordComponent,
    title: 'Change Password',
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Forgot Password',
  },

 
  {
    path: 'catalog',
    component: CatalogComponent,  // déjà <app-footer> dans son template ✓
    title: 'Catalogue',
  },
  {
    path: 'nearby',
    loadComponent: () =>
      import('./features/catalog-product/nearby/nearby.component').then(m => m.NearbyComponent),
  },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./features/catalog-product/promotions/promotions.component').then(m => m.PromotionsComponent),
  },
  {
    path: 'details/:productId',
    loadComponent: () =>
      import('./features/catalog-product/details-page/details-page.component').then(m => m.DetailsPageComponent),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/carts/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profil/profil.component').then(m => m.ProfilComponent),
    // → ajouter <app-footer> dans profil.component.html
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    title: 'Checkout',
    loadComponent: () =>
      import('./features/carts/checkout/checkout.component').then(m => m.CheckoutComponent),
    // → ajouter <app-footer> dans checkout.component.html (ou pas, selon votre choix)
  },
  {
    path: 'orders',
    component: OrdersComponent,
    title: 'My Orders',
    canActivate: [authGuard],
    // → ajouter <app-footer> dans orders.component.html
  },
  {
    path: 'order-tracking/:id',
    component: OrderTrackingComponent,
    title: 'Order Details',
    canActivate: [authGuard],
    // → ajouter <app-footer> dans order-tracking.component.html
  },
  {
    path: 'order-confirmation/:orderId',
    canActivate: [authGuard],
    component: ConfirmationOrderComponent,
    title: 'Order Confirmation',
  },
  {
    path: 'payment-success/:orderId',
    component: PaymentSuccessComponent,
    title: 'Payment Success',
    // canActivate: [authGuard],
  },
  {
    path: 'payment-cancel/:orderId',
    component: CancelPaymentComponent,
    title: 'Payment Canceled',
    // canActivate: [authGuard],
  },
  {
    path: 'payment-confirm/:orderId',
    loadComponent: () => import('./features/payments/stripe-confirmation/stripe-confirmation.component').then(m => m.StripeConfirmationComponent)
  },
  {
    path: 'become-delivery',
    component: RegisterDriverComponent,
    title: 'Become a Delivery Driver',
    canActivate: [authGuard],
    // → ajouter <app-footer> dans register-driver.component.html
  },

  {
    path: 'scanner-validate',
    component: ScanOrderComponent,
    title: 'Scanner order',
    // canActivate: [authGuard],
  },
  // ════════════════════════════════════════════════════════════
  // PAGES SECONDAIRES — footer optionnel selon vos préférences
  // ════════════════════════════════════════════════════════════

  {
    path: 'TermandConditions',
    component: TermsServiceComponent,
    title: 'Terms of Service',
  },
  {
    path: 'privacy-policy',
    component: PravacyPolicyComponent,
    title: 'Privacy Policy',
  },
  {
    path: 'help-support',
    component: HelpSupportComponent,
    title: 'Help & Support',
  },
  {
    path: 'payment-policy',
    component: PaymentPolicyComponent,
    title: 'Payment Policy',
  },

  // Fallback
  { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' },
];