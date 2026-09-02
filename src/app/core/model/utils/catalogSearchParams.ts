export interface CatalogSearchParams {

  inStockOnly?: boolean;
  promotionOnly?: boolean;

  minPrice?: number;
  maxPrice?: number;

  lat?: number;
  lng?: number;

  radiusKm?: number;

  page?: number;
  size?: number;

  sort?: string;
}