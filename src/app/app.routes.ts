import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: 'catalog', loadComponent: () => import('./catalog/catalog.component').then(m => m.CatalogComponent)},
 
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
  {path:'cart',
    loadComponent:()=> import('./cart/cart.component').then(m => m.CartComponent)
  },
  {
    path:'profile',
    loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent)
  },
  {path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)},
  {path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)},
   {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  }
];