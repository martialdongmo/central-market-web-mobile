import { inject, Injectable } from '@angular/core';
import { CustomerService } from './customer.service';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  
  private customerService = inject(CustomerService);
  private cartService =    inject(CartService); 
  
  
}
