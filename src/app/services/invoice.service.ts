import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

    private readonly API_URL = environment.invoiceEndpoint;
  
    private http = inject(HttpClient);

     downloadInvoicePdf(orderId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${orderId}/pdf`, {
      responseType: 'blob'
    });
  }
  
}
