import { Currency } from "./enums/currency-type";

export interface CartItem {
  shopLatitude: number;
  shopLongitude: number;
  productId: string;

  productName: string;
  imageUrl?: string;

  price: number;
  currency: Currency;    // NEW
  promotionPrice?: number | null;
  promotionActive: boolean; 

  shopId: string;
  userUuid: string;
  shopName: string;
  shopEmail: string;

  quantity: number;
}