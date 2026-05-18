import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { authGuard } from './auth/guards/auth-guard';
import { ConfirmationOrderComponent } from './orders/confirmation-order/confirmation-order.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';

export const routes: Routes = [

  {
    path: 'catalog',
    loadComponent: () => import('./catalog/catalog.component').then(m => m.CatalogComponent)
  },

  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },

  {
    path: 'secure-app',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    component: VerifyOtpComponent,
    title: 'Verify OTP',
    path: 'verify-otp'
  }
  ,
  
  {
    path: 'nearby',
    loadComponent: () => import('./nearby/nearby.component').then(m => m.NearbyComponent)
  },

  {
    path: 'promotions',
    loadComponent: () => import('./promotions/promotions.component').then(m => m.PromotionsComponent)
  },
  {
    path: 'details/:productId',
    loadComponent: () => import('./details-page/details-page.component').then(m => m.DetailsPageComponent)
  },

  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)
  },

  {
    canActivate: [authGuard],
    path: 'profile',
    loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent)
  },

  
  {
      canActivate: [authGuard],
    title: 'Checkout',
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'order-tracking/:orderId',
    loadComponent: () => import('./order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent)
  },

  {
    canActivate: [authGuard],
    component: ConfirmationOrderComponent,
    title: 'Order Confirmation',
    path: 'order-confirmation/:orderId'
  },

  { path: 'callback', component: CallbackComponent },

  { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' },
];
