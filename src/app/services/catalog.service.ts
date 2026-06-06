import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CatalogQueryParams } from '../model/utils/catalog-query-params.model';
import { PageResponse } from '../model/response/page-response.model';
import { CatalogProductResponse } from '../model/response/catalogProductResponse';


@Injectable({
  providedIn: 'root',
})
export class CatalogService {

  private readonly CATALOG_API_URL = environment.CATALOG_API_URL;


  private http = inject(HttpClient);


search(p: CatalogQueryParams): Observable<PageResponse<CatalogProductResponse>> {
  let params = new HttpParams()
    .set('inStockOnly',   p.inStockOnly   ?? false)
    .set('promotionOnly', p.promotionOnly ?? false)
    .set('page',          p.page          ?? 0)
    .set('size',          p.size          ?? 20);

  // optional — only append when provided
  if (p.minPrice  != null) params = params.set('minPrice',  p.minPrice);
  if (p.maxPrice  != null) params = params.set('maxPrice',  p.maxPrice);
  if (p.lat       != null) params = params.set('lat',       p.lat);
  if (p.lng       != null) params = params.set('lng',       p.lng);
  if (p.radiusKm  != null) params = params.set('radiusKm',  p.radiusKm);
  if (p.sort      != null) params = params.set('sort',      p.sort);

  return this.http.get<PageResponse<CatalogProductResponse>>(
    `${this.CATALOG_API_URL}/all`, { params }
  ).pipe(tap(response => {
    console.log('Catalog search response:', response);
  }));
}

}
