export interface StripePaymentIntentResponse {
    orderId: string;
  clientSecret: string;
  paymentIntentId: string;
  referenceId: string;
  publishableKey: string;
  amount: number;
  currency: string;
  status: string;
}