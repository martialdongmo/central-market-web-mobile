export interface CatalogProductResponse {
    /* =========================================================
     PRODUCT INFO
     ========================================================= */

  productId: string;
  productName: string;
  description: string;
  imageUrl: string;

  categoryId: string;
  categoryName: string;

  /* =========================================================
     PRICING
     ========================================================= */

  price: number;
  promotionPrice: number;
  promotionActive: boolean;

  /* =========================================================
     INVENTORY
     ========================================================= */

  inStock: boolean;
  availableQuantity: number;

  /* =========================================================
     SHOP INFO
     ========================================================= */

  shopId: string;
  userUuid: string;
  shopEmail: string;
  shopName: string;
  shopOpen: boolean;

  /* =========================================================
     LOCATION / GEO
     ========================================================= */

  shopLatitude?: number;
  shopLongitude?: number;
  distanceKm: number;

  /* =========================================================
     ANALYTICS / RANKING
     ========================================================= */

  popularityScore: number;
  totalSales: number;
}