import { OrderItemResponse } from "../orderItemResponse";
import { DeliveryType } from "../../enums/deliveryType";
import { PaymentMethod } from "../../enums/payment-method";
import { OrderStatus } from "./orderStatus";
import { CustomerShopGroupResponse } from "./customerShopGroupResponse";

export interface CustomerOrderDetailResponse {
  id: string; // UUID → string
  reference: string;
  status: OrderStatus; // Enum → custom TS enum

  // ─── Financials ───────────────────────────────
  subtotalAmount: number; // BigDecimal → number
  deliveryFee: number;
  totalAmount: number;

  // ─── Payment + delivery ───────────────────────
  paymentMethod: PaymentMethod; // Enum → custom TS enum
  deliveryType: DeliveryType;   // Enum → custom TS enum

  // ─── Address ──────────────────────────────────
  deliveryAddressId: string; // UUID → string
  addressLine: string;

  // ─── Customer ─────────────────────────────────
  customerFullName: string;
  customerPhoneNumber: string;

  note: string;
  createdAt: Date; // LocalDateTime → Date

  // ─── Items grouped by shop ────────────────────
  shopGroups: CustomerShopGroupResponse[]; // List<CustomerShopGroupResponse> → array
}
