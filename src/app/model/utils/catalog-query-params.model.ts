export interface CatalogQueryParams {
  keyword?:       string;
  categoryId?:    string;

  promotionOnly?: boolean;
  inStockOnly?:   boolean;
  minPrice?:      number;
  maxPrice?:      number;

  lat?:           number;
  lng?:           number;
  radiusKm?:      number;

  page?:          number;
  size?:          number;
  sort?:          string;
}