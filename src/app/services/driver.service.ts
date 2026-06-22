import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { DriverResponse } from '../model/response/driver-response';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { DriverRegistrationRequest } from '../model/requests/driver-registration-request';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
    private readonly API_URL = environment.driversEndpoint;

  private http = inject(HttpClient);

   public registerDriver(request: DriverRegistrationRequest): Observable<DriverResponse> {
      return this.http.post<DriverResponse>(
        `${this.API_URL}/register`,
        request
      )
        .pipe(
          tap((response) => console.log('driver created:', response)),
          catchError((error) => {
            console.error('Error creating driver:', error);
            return throwError(() => new Error('Failed to create driver. Please try again later.'));
          })
        );
    }



}
