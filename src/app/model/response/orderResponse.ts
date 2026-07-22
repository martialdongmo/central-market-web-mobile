import { PaymentMethod } from "../enums/payment-method";
import { OrderItemResponse } from "./orderItemResponse";
import { DeliveryType } from "../enums/deliveryType";
import { OrderStatus } from "./orders/orderStatus";

export interface OrderResponse {
  id: string; // UUID → string
  totalAmount: number; // BigDecimal → number
  subtotalAmount: number;
  deliveryFee: number;

  reference: string;
  status: OrderStatus; // Enum → custom TS enum
  deliveryType: DeliveryType; // Enum → custom TS enum

  paymentMethod: PaymentMethod; // Enum → custom TS enum

  customerId: string; // UUID → string
  shopId: string;
  deliveryAddressId: string;

  items: OrderItemResponse[]; // List<OrderItemResponse> → array

  createdAt: Date; // LocalDateTime → Date
  createdBy: string;
}
