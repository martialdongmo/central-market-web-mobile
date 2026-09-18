import { Currency } from "../../enums/currency-type";

export interface OrderItemResponse {
  productId: string;      // UUID → string
  productName: string;
  imageUrl: string;

  priceAtPurchase: number; // BigDecimal → number
  currency:Currency;        // Enum → custom TS enum
  quantity: number;        // Integer → number

  shopId: string;          // UUID → string
  shopName: string;
}
