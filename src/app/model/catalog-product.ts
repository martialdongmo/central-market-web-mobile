export interface CatalogProduct {

  id: string;

  /* =========================================================
     PRODUCT INFO
     ========================================================= */

  sku: string;

  name: string;
  description: string;

  productId: string;

  /* =========================================================
     PRICING
     ========================================================= */

  price: number;
  promotionPrice: number;

  /* =========================================================
     INVENTORY
     ========================================================= */

  availableQuantity: number;
  inStock: boolean;

  unitOfMeasure: string;

  active: boolean;
  promotion: boolean;

  promotionStart: string;
  promotionEnd: string;

  /* =========================================================
     SHOP INFO
     ========================================================= */

  shopId: string;
  shopName: string;

  /* =========================================================
     CATEGORY
     ========================================================= */

  categoryId: string;
  categoryName: string;

  /* =========================================================
     MEDIA
     ========================================================= */

  imageUrl: string;

  /* =========================================================
     ANALYTICS
     ========================================================= */

  soldCount: number;
  popularityScore: number;

  /* =========================================================
     LOCATION
     ========================================================= */

  latitude: number;
  longitude: number;
}