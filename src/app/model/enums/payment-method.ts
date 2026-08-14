export enum PaymentMethod {
  MTN_MOBILE_MONEY = 'MTN_MOBILE_MONEY',
  ORANGE_MONEY = 'ORANGE_MONEY',
  CASH = 'CASH',
  STRIPE = 'STRIPE',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.MTN_MOBILE_MONEY]: 'MTN Mobile Money',
  [PaymentMethod.ORANGE_MONEY]: 'Orange Money',
  [PaymentMethod.CASH]: 'Espèces',
  [PaymentMethod.STRIPE]: 'Carte bancaire (Stripe)',
};
