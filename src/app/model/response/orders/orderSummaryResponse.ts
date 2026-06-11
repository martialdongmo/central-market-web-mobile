import { DeliveryType } from "../../enums/deliveryType";
import { PaymentMethod } from "../../enums/payment-method";
import { OrderStatus } from "./orderStatus";

export interface OrderSummaryResponse {
  id: string;
  reference: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  itemCount: number;
  createdAt: string;
}