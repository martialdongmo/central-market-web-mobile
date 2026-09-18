import { Currency } from "../enums/currency-type";

export interface OrderItemRequest {
  shopId: string;
  userUuid: string;
  shopName: string;
  shopEmail: string;
  shopLatitude: number;
  shopLongitude: number; 
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;    // NEW
  imageUrl: string;
}