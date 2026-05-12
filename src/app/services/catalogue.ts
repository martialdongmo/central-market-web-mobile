import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CatalogQueryParams } from '../model/catalog-query-params.model';
import { CatalogProductResponse } from '../model/catalog-product-response.model';
import { PageResponse } from '../model/page-response.model';
import { MOCK_PRODUCTS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class Catalogue {
  private page(params?: CatalogQueryParams): Observable<PageResponse<CatalogProductResponse>> {
    let list = [...MOCK_PRODUCTS];
    if (params?.keyword)      list = list.filter(p => p.productName.toLowerCase().includes(params.keyword!.toLowerCase()) || p.shopName.toLowerCase().includes(params.keyword!.toLowerCase()));
    if (params?.promotionOnly) list = list.filter(p => p.promotionActive);
    if (params?.maxPrice)      list = list.filter(p => (p.promotionPrice ?? p.price) <= params.maxPrice!);
    if (params?.categoryId && params.categoryId !== 'all') list = list.filter(p => p.categoryId === params.categoryId);
    const res: PageResponse<CatalogProductResponse> = {
      content: list, totalElements: list.length, totalPages: 1,
      size: params?.size ?? 20, number: params?.page ?? 0,
      pageable: { pageNumber: 0, pageSize: 20, offset: 0, paged: true, unpaged: false },
      first: true, last: true, numberOfElements: list.length, empty: list.length === 0,
    };
    return of(res).pipe(delay(600));
  }

  search(params: CatalogQueryParams) { return this.page(params); }
  getNearby(params: CatalogQueryParams) { return this.page(params); }
  getPromotions(params?: CatalogQueryParams) { return this.page({ ...params, promotionOnly: true }); }
  getByShop(shopId: string, params?: CatalogQueryParams) { return this.page(params); }
  getByCategory(categoryId: string, params?: CatalogQueryParams) { return this.page(params); }
  searchKeyword(params: CatalogQueryParams) { return this.page(params); }

  getDetails(productId: string): Observable<CatalogProductResponse> {
    const p = MOCK_PRODUCTS.find(x => x.productId === productId) ?? MOCK_PRODUCTS[0];
    return of(p).pipe(delay(300));
  }
}
