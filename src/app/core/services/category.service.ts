import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { CategoryResponse } from '../model/response/categoryResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  API_URL = environment.publicEndPoint;

  constructor(private http: HttpClient) { }

  getShopProductCategories(shopId: string): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.API_URL}/shop-category/${shopId}`);
  }

  getAll(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.API_URL}/categories/all`);
  }


}
