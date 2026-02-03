export interface CatalogQueryParams {
  inStockOnly?: boolean;
  promotionOnly?: boolean;

  minPrice?: number;
  maxPrice?: number;

  lat?: number;
  lng?: number;
  radiusKm?: number;

  keyword?: string;
  categoryId?: string;

  page?: number;
  size?: number;
}