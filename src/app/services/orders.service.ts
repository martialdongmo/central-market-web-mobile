import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { OrderRequest } from '../model/requests/order-request';
import { OrderResponse } from '../model/response/orderResponse';
import { CustomerOrderDetailResponse } from '../model/response/orders/customer.order.detail.response';
import { PageResponse } from '../model/response/orders/page.response';
import { OrderSummaryResponse } from '../model/response/orders/orderSummaryResponse';
import { OrderStatus } from '../model/response/orders/orderStatus';

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
      );
  }




  getCustomerOrderDetail(orderId: string): Observable<CustomerOrderDetailResponse> {
    return this.http.get<CustomerOrderDetailResponse>(
      `${this.API_URL}/customer/${orderId}`
    );
  }

  getCustomerOrders(
    page: number = 0,
    size: number = 20,
    status?: OrderStatus,
    from?: string,
    to?: string
  ): Observable<PageResponse<OrderSummaryResponse>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (status) {
      params = params.set('status', status);
    }

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<PageResponse<OrderSummaryResponse>>(
      `${this.API_URL}/customer`,
      { params }
    ).pipe(
      tap(console.log.bind(console, 'Fetched customer orders:', params)),
      catchError((error) => {
        console.error('Error fetching customer orders:', error);
        return throwError(() => new Error('Failed to fetch orders. Please try again later.'));
      })
    );
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






}
