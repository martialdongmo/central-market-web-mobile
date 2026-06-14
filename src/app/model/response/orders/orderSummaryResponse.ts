import { DeliveryType } from "../../enums/deliveryType";
import { PaymentMethod } from "../../enums/payment-method";
import { OrderStatus } from "./orderStatus";

export interface OrderSummaryResponse {
  id: string; // UUID → string
  reference: string;
  status: OrderStatus; // Enum → custom TS enum
  totalAmount: number; // BigDecimal → number
  deliveryFee: number; // BigDecimal → number
  paymentMethod: PaymentMethod; // Enum → custom TS enum
  deliveryType: DeliveryType; // Enum → custom TS enum
  itemCount: number; // int → number
  createdAt: Date; // LocalDateTime → Date
}

