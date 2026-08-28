import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { CustomerResponse } from '../model/response/customer-response';
import { Observable, tap } from 'rxjs';
import { CustomerRequest } from '../model/requests/customerRequest';
import { Preferences } from '@capacitor/preferences';
import { DeliveryAddressResponse } from '../model/response/deliveryAddressResponse';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  private readonly STORAGE_KEY = 'customer_info';
    private readonly STORAGE_ADDRESS_KEY = 'customer_address_info';

  private readonly API_URL = environment.customersEndpoint;

  private http = inject(HttpClient);

  public saveNewCustomer(request:CustomerRequest):Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${this.API_URL}/create`, request)
    .pipe(
      tap(response => {
        console.log('Fetched customer by userId:', response);
        this.saveToStorage(response);
      })
    );;
  }

  public getCustomerByEmail(email: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.API_URL}/email/${email}`);
  } 

  public getCustomerById(customerId: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.API_URL}/${customerId}`);
  }

  public getCustomerByUserId(userId: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.API_URL}/by-user/${userId}`).pipe(
      tap(response => {
        console.log('Fetched customer by userId:', response);
        this.saveToStorage(response);
      })
    );
  }

   public getCustomerAddress(deliveryAddressId: string): Observable<DeliveryAddressResponse> {
    return this.http.get<DeliveryAddressResponse>(`${this.API_URL}/address/${deliveryAddressId}`).pipe(
      tap(response => {
        console.log('Fetched customer address:', response);
      })
    );
  }

  public async saveToStorage(customer: CustomerResponse) {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(customer),
      });
    } catch (error) {
      console.error('Error saving customer to storage', error);
    }
  }

  public async getFromStorage(): Promise<CustomerResponse | null> {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEY });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error('Error retrieving customer from storage', error);
      return null;
    }
  }

  public async clearStorage() {
    try {
      await Preferences.remove({ key: this.STORAGE_KEY });
    } catch (error) {
      console.error('Error clearing customer from storage', error);
    }
  }
  
}
