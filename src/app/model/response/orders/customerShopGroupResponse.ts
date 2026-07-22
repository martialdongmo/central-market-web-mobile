import { ShopDeliveryStatus } from "../../enums/shopDeliveryStatus";
import { OrderItemResponse } from "./orderItemResponse";

export interface CustomerShopGroupResponse {
  shopOrderId: string; // UUID → string
  shopId: string;      // UUID → string
  shopName: string;

  // ─── This shop's delivery status ──────────────
  deliveryStatus: ShopDeliveryStatus; // Enum → custom TS enum
  trackingCode: string;
  estimatedDeliveryAt: Date; // LocalDateTime → Date
  deliveredAt: Date;         // LocalDateTime → Date

  // ─── This shop's financials ───────────────────
  shopSubtotal: number; 
  deliveryFee: number;

  // ─── This shop's items only ───────────────────
  items: OrderItemResponse[]; 
}
