import { Currency } from "../enums/currency-type";
import { ProductCategory } from "../enums/product-category";
import { CatalogProductVariantResponse } from "./catalog-product-variant-response";

export interface CatalogProductResponse {

   /* =========================================================
    PRODUCT INFO
    ========================================================= */
   productId: string;
   productName: string;
   description: string;
   imageUrl: string;
   images: string[];
   tags: string[];
   weight: number | null;
   categoryId: string;
   categoryName: ProductCategory; // 

   /* =========================================================
      PRICING
      ========================================================= */
   price: number;
   currency: Currency;    // NEW
   referencePrice: number;  // NEW

   
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

   /* =========================================================
      VARIANTS (detail view only)
      ========================================================= */
   variants: CatalogProductVariantResponse[];
}