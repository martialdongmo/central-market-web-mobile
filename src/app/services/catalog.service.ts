import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CatalogQueryParams } from '../model/utils/catalog-query-params.model';
import { PageResponse } from '../model/response/page-response.model';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';

@Injectable({ providedIn: 'root' })
export class CatalogService {

  private readonly CATALOG_API_URL = environment.CATALOG_API_URL;
  private http = inject(HttpClient);

  // =========================
  // GLOBAL SEARCH -> GET /all
  // =========================
  search(p: CatalogQueryParams): Observable<PageResponse<CatalogProductResponse>> {
    let params = new HttpParams()
      .set('inStockOnly', p.inStockOnly ?? false)
      .set('promotionOnly', p.promotionOnly ?? false)
      .set('page', p.page ?? 0)
      .set('size', p.size ?? 20);

    if (p.minPrice != null) params = params.set('minPrice', p.minPrice);
    if (p.maxPrice != null) params = params.set('maxPrice', p.maxPrice);
    if (p.lat != null) params = params.set('lat', p.lat);
    if (p.lng != null) params = params.set('lng', p.lng);
    if (p.radiusKm != null) params = params.set('radiusKm', p.radiusKm);
    if (p.sort != null) params = params.set('sort', p.sort);

    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.CATALOG_API_URL}/all`, { params }
    ).pipe(tap(res => console.log('Catalog search response:', res)));
  }

  // =========================
  // BY SHOP -> GET /shop/{shopId}
  // =========================
  getByShop(
    shopId: string,
    inStockOnly = false,
    promotionOnly = false,
    page = 0,
    size = 20,
    sort?: string
  ): Observable<PageResponse<CatalogProductResponse>> {
    let params = new HttpParams()
      .set('inStockOnly', inStockOnly)
      .set('promotionOnly', promotionOnly)
      .set('page', page)
      .set('size', size);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.CATALOG_API_URL}/shop/${shopId}`, { params }
    );
  }

  // =========================
  // BY CATEGORY -> GET /category/{categoryId}
  // =========================
  getByCategory(
    categoryId: string,
    lat?: number,
    lng?: number,
    radiusKm?: number,
    page = 0,
    size = 20,
    sort?: string
  ): Observable<PageResponse<CatalogProductResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (lat != null) params = params.set('lat', lat);
    if (lng != null) params = params.set('lng', lng);
    if (radiusKm != null) params = params.set('radiusKm', radiusKm);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.CATALOG_API_URL}/category/${categoryId}`, { params }
    );
  }

  // =========================
  // NEARBY -> GET /nearby
  // =========================
  getNearby(
    lat: number,
    lng: number,
    radiusKm = 10,
    page = 0,
    size = 20,
    sort?: string
  ): Observable<PageResponse<CatalogProductResponse>> {
    let params = new HttpParams()
      .set('lat', lat)
      .set('lng', lng)
      .set('radiusKm', radiusKm)
      .set('page', page)
      .set('size', size);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.CATALOG_API_URL}/nearby`, { params }
    );
  }

  // =========================
  // PROMOTIONS -> GET /promotions
  // =========================
  getPromotions(
    lat?: number,
    lng?: number,
    page = 0,
    size = 20,
    sort?: string
  ): Observable<PageResponse<CatalogProductResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (lat != null) params = params.set('lat', lat);
    if (lng != null) params = params.set('lng', lng);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.CATALOG_API_URL}/promotions`, { params }
    );
  }

  // =========================
  // KEYWORD SEARCH -> GET /search
  // =========================
  searchByKeyword(
    keyword: string,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    inStockOnly = false,
    lat?: number,
    lng?: number,
    page = 0,
    size = 20,
    sort?: string
  ): Observable<PageResponse<CatalogProductResponse>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('inStockOnly', inStockOnly)
      .set('page', page)
      .set('size', size);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (minPrice != null) params = params.set('minPrice', minPrice);
    if (maxPrice != null) params = params.set('maxPrice', maxPrice);
    if (lat != null) params = params.set('lat', lat);
    if (lng != null) params = params.set('lng', lng);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PageResponse<CatalogProductResponse>>(
      `${this.CATALOG_API_URL}/search`, { params }
    );
  }

  // =========================
  // PRODUCT DETAILS (avec geo) -> GET /product/{productId}
  // =========================
  getProductDetails(
    productId: string,
    lat?: number,
    lng?: number
  ): Observable<CatalogProductResponse> {
    let params = new HttpParams();
    if (lat != null) params = params.set('lat', lat);
    if (lng != null) params = params.set('lng', lng);

    return this.http.get<CatalogProductResponse>(
      `${this.CATALOG_API_URL}/product/${productId}`, { params }
    );
  }

  // =========================
  // PRODUCT SIMPLE (sans geo) -> GET /product-1/{productId}
  // =========================
  getProduct(productId: string): Observable<CatalogProductResponse> {
    return this.http.get<CatalogProductResponse>(
      `${this.CATALOG_API_URL}/product-1/${productId}`
    ).pipe(tap(product => console.log('Product response:', product)));
  }
}