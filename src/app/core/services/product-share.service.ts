import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProductShare {
   private readonly baseUrl = environment.baseUrl + '/share';
    private http = inject(HttpClient);
  
}
