import { inject, Injectable } from '@angular/core';
import { PaymentRequest } from '../model/requests/paymentRequest';
import { environment } from 'src/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentResponse } from '../model/response/paymentResponse';
import { tap } from 'rxjs/operators';
import { pipe } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private readonly API_URL = environment.paymentEndpoint;

  private http = inject(HttpClient);


  // =====================================================
  // INIT MTN PAYMENT
  // =====================================================
  initiateMtnPayment(request: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/mtn`,
      request
    );
  }



  initiateOMPayment( request: PaymentRequest): Observable<any> {

    return this.http.post<any>(
      `${this.API_URL}/om`,
      request
    ).pipe(tap(console.log));
  }

  // =====================================================
  // CHECK PAYMENT STATUS
  // =====================================================
  checkMtnStatus(referenceId: string): Observable<any> {
    return this.http.get(
      `${this.API_URL}/mtn/status/${referenceId}`
    );
  }

  public createCASHPayment(request:PaymentRequest):Observable<PaymentResponse>{
    return this.http.post<PaymentResponse>( `${this.API_URL}/cash`,request).pipe(tap(console.log));
  }

 

  getAllPaymets(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.API_URL}/all`)
      .pipe(tap(console.log));

  }

}
