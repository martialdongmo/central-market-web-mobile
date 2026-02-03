import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { PageResponse } from '../model/page-response.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Catalogue {
     private readonly API = environment.URL;

  constructor(private http: HttpClient) {}

  /* 🔍 /search */
  search(params: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/search`,
      { params: this.buildParams(params) }
    );
  }

  /* /shop/{shopId} */
  getByShop(
    shopId: string,
    params?: CatalogQueryParams
  ) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/shop/${shopId}`,
      { params: this.buildParams(params) }
    );
  }

  /*  /category/{categoryId} */
  getByCategory(
    categoryId: string,
    params?: CatalogQueryParams
  ) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/category/${categoryId}`,
      { params: this.buildParams(params) }
    );
  }

  /*  /nearby */
  getNearby(params: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/nearby`,
      { params: this.buildParams(params) }
    );
  }

  /* /promotions */
  getPromotions(params?: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/promotions`,
      { params: this.buildParams(params) }
    );
  }

  /*  /search-keyword */
  searchKeyword(params: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/search-keyword`,
      { params: this.buildParams(params) }
    );
  }

  /*  /details/{productId} → PAS paginé */
  getDetails(productId: string, lat?: number, lng?: number) {
    let params = new HttpParams();
    if (lat !== undefined) params = params.set('lat', lat);
    if (lng !== undefined) params = params.set('lng', lng);

    return this.http.get<CatalogProductResponse>(
      `${this.API}/details/${productId}`,
      { params }
    );
  }

  /*  helper */
  private buildParams(params?: CatalogQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value);
      }
    });

    return httpParams;
  }
}
