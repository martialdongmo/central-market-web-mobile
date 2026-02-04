import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { PageResponse } from '../model/page-response.model';
import { environment } from 'src/environments/environment.prod';
import { MOCK_PRODUCTS } from './mock-data';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Catalogue {
     private readonly API = environment.URL;

  constructor(private http: HttpClient) {}

  /* 🔍 /search 
  search(params: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/search`,
      { params: this.buildParams(params) }
    );
  }
*/
  /* /shop/{shopId} 
  getByShop(
    shopId: string,
    params?: CatalogQueryParams
  ) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/shop/${shopId}`,
      { params: this.buildParams(params) }
    );
  }
*/
  /*  /category/{categoryId} 
  getByCategory(
    categoryId: string,
    params?: CatalogQueryParams
  ) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/category/${categoryId}`,
      { params: this.buildParams(params) }
    );
  }
*/
  /*  /nearby 
  getNearby(params: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/nearby`,
      { params: this.buildParams(params) }
    );
  }
*/
  /* /promotions 
  getPromotions(params?: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/promotions`,
      { params: this.buildParams(params) }
    );
  }
*/
  /*  /search-keyword 
  searchKeyword(params: CatalogQueryParams) {
    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.API}/search-keyword`,
      { params: this.buildParams(params) }
    );
  }
*/
  /*  /details/{productId} → PAS paginé 
  getDetails(productId: string, lat?: number, lng?: number) {
    let params = new HttpParams();
    if (lat !== undefined) params = params.set('lat', lat);
    if (lng !== undefined) params = params.set('lng', lng);

    return this.http.get<CatalogProductResponse>(
      `${this.API}/details/${productId}`,
      { params }
    );
  }
*/
  /*  helper 
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
*/
  /* On utilise cette méthode privée pour simuler la pagination et les filtres */
  private getMockedPage(params?: CatalogQueryParams): Observable<PageResponse<CatalogProductResponse>> {
    let filtered = [...MOCK_PRODUCTS];

    if (params) {
      if (params.keyword) {
        filtered = filtered.filter(p => p.productName.toLowerCase().includes(params.keyword!.toLowerCase()));
      }
      if (params.promotionOnly) {
        filtered = filtered.filter(p => p.promotionActive);
      }
      if (params.maxPrice) {
        filtered = filtered.filter(p => (p.promotionPrice || p.price) <= params.maxPrice!);
      }
    }

    // On simule une réponse paginée
    const response: PageResponse<CatalogProductResponse> = {
      content: filtered,
      totalElements: filtered.length,
      totalPages: 1,
      size: params?.size || 10,
      number: params?.page || 0,
      pageable: {
        pageNumber: 0,
        pageSize: 0,
        offset: 0,
        paged: false,
        unpaged: false
      },
      first: false,
      last: false,
      numberOfElements: 0,
      empty: false
    };

    return of(response).pipe(delay(800)); // Delay pour voir les skeletons
  }

  search(params: CatalogQueryParams) { return this.getMockedPage(params); }
  
  getByShop(shopId: string, params?: CatalogQueryParams) { return this.getMockedPage(params); }

  getByCategory(categoryId: string, params?: CatalogQueryParams) { return this.getMockedPage(params); }

  getNearby(params: CatalogQueryParams) { return this.getMockedPage(params); }

  getPromotions(params?: CatalogQueryParams) {
    const promoParams = { ...params, promotionOnly: true };
    return this.getMockedPage(promoParams);
  }

  searchKeyword(params: CatalogQueryParams) { return this.getMockedPage(params); }

 getDetails(productId: string): Observable<CatalogProductResponse> {
  // AJOUTE CE LOG POUR VOIR SI LE SERVICE EST APPELÉ
  console.log("Service appelé pour l'ID:", productId);
  
  const product = MOCK_PRODUCTS[0]; // On force le premier produit pour tester
  return of(product).pipe(delay(500));
}
}
