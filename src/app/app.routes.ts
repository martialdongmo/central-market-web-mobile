import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { authGuard } from './auth/guards/auth-guard';
import { ConfirmationOrderComponent } from './orders/confirmation-order/confirmation-order.component';
import { VerifyOtpComponent } from './auth/verify-otp/verify-otp.component';
import { CatalogComponent } from './catalog/catalog.component';
import { PaymentService } from './services/payment.service';
import { PaymentSuccessComponent } from './carts/payment-success/payment-success.component';
import { OrdersComponent } from './orders/my-orders/orders.component';
import { OrderTrackingComponent } from './orders/order-tracking/order-tracking.component';
import { TermsServiceComponent } from './shares/terms-service/terms-service.component';
import { Component } from '@angular/core';
import { PravacyPolicyComponent } from './shares/pravacy-policy/pravacy-policy.component';
import { HelpSupportComponent } from './shares/help-support/help-support.component';
import { PaymentPolicyComponent } from './shares/payment-policy/payment-policy.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';

export const routes: Routes = [

 {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },

  {
    path: 'catalog',
    component:CatalogComponent,
    title: 'Catalog'
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
    loadComponent: () => import('./carts/cart/cart.component').then(m => m.CartComponent)
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
    loadComponent: () => import('./carts/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    title: 'My orders',
    path: 'orders',
   component: OrdersComponent,
   canActivate: [authGuard]
  },
  {
    path: 'order-tracking/:id',
    component: OrderTrackingComponent,
    title: 'order-details',
    canActivate: [authGuard]
  },

  {
    canActivate: [authGuard],
    component: ConfirmationOrderComponent,
    title: 'Order Confirmation',
    path: 'order-confirmation/:orderId'
  },

  {
    component: PaymentSuccessComponent,
    title: 'payment-success',
    path: 'payment-success/:orderId',
    canActivate:[authGuard]
  },

  { path: 'callback', component: CallbackComponent },

  {
    path: 'TermandConditions',
    component: TermsServiceComponent,
    title: 'Term of Service'
  },

  {
    component: PravacyPolicyComponent,
    title: 'Privacy Policy',  
    path: 'privacy-policy'
  },
  // help and suport
  {
    component: HelpSupportComponent,
    title: 'Help & Support',
    path: 'help-support'
  },
  {
    component: PaymentPolicyComponent,
    title: 'Payment Policy', 
    path: 'payment-policy'
  },

  {
    component: ChangePasswordComponent,
    path: 'change-password',
    title: 'Change Password'
  },
  { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' },
];
