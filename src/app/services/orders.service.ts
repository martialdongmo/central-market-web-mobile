import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { OrderRequest } from '../model/requests/order-request';
import { OrderResponse } from '../model/response/orderResponse';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
 

  private readonly API_URL = environment.orderEndpoint;

  private http = inject(HttpClient);

  public createNewOrder(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(
      `${this.API_URL}/create`,
      request
    )
    .pipe(
      tap((response) => console.log('Order created:', response)),
      catchError((error) => {
        console.error('Error creating order:', error);
        return throwError(() => new Error('Failed to create order. Please try again later.'));
      })
    ) ;
  }

  public getOrder(orderId: string): Observable<OrderResponse> {
  return this.http.get<OrderResponse>(
    `${this.API_URL}/${orderId}`
  );
}

public getMyOrders(customerId: string): Observable<OrderResponse> {
  return this.http.get<OrderResponse>(
    `${this.API_URL}/customer/${customerId}`
  );
}

 

getOrderById(orderId: string) {
    throw new Error('Method not implemented.');
}



}
