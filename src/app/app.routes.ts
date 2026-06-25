import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';

// ─── Pages importées directement (peu fréquentes ou déjà chargées) ──────────
import { PageNotFoundComponent }    from './page-not-found/page-not-found.component';
import { CallbackComponent }        from './auth/callback/callback.component';
import { ConfirmationOrderComponent } from './orders/confirmation-order/confirmation-order.component';
import { VerifyOtpComponent }       from './auth/verify-otp/verify-otp.component';
import { CatalogComponent }         from './catalog/catalog.component';
import { PaymentSuccessComponent }  from './carts/payment-success/payment-success.component';
import { OrdersComponent }          from './orders/my-orders/orders.component';
import { OrderTrackingComponent }   from './orders/order-tracking/order-tracking.component';
import { TermsServiceComponent }    from './shares/terms-service/terms-service.component';
import { PravacyPolicyComponent }   from './shares/pravacy-policy/pravacy-policy.component';
import { HelpSupportComponent }     from './shares/help-support/help-support.component';
import { PaymentPolicyComponent }   from './shares/payment-policy/payment-policy.component';
import { ChangePasswordComponent }  from './auth/change-password/change-password.component';
import { RegisterDriverComponent }  from './driver/register-driver/register-driver.component';
import { ScanOrderComponent } from './driver/scan-order/scan-order.component';

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
    component: ChangePasswordComponent,
    title: 'Change Password',
  },

  // ════════════════════════════════════════════════════════════
  // PAGES AVEC FOOTER
  // Chaque template se termine par <app-footer></app-footer>
  // ════════════════════════════════════════════════════════════

  {
    path: 'catalog',
    component: CatalogComponent,  // déjà <app-footer> dans son template ✓
    title: 'Catalogue',
  },
  {
    path: 'nearby',
    loadComponent: () =>
      import('./nearby/nearby.component').then(m => m.NearbyComponent),
    // → ajouter <app-footer> dans nearby.component.html
  },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./promotions/promotions.component').then(m => m.PromotionsComponent),
    // → ajouter <app-footer> dans promotions.component.html
  },
  {
    path: 'details/:productId',
    loadComponent: () =>
      import('./details-page/details-page.component').then(m => m.DetailsPageComponent),
    // → ajouter <app-footer> dans details-page.component.html
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./carts/cart/cart.component').then(m => m.CartComponent),
    // → ajouter <app-footer> dans cart.component.html
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./profil/profil.component').then(m => m.ProfilComponent),
    // → ajouter <app-footer> dans profil.component.html
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    title: 'Checkout',
    loadComponent: () =>
      import('./carts/checkout/checkout.component').then(m => m.CheckoutComponent),
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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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