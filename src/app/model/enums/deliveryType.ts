export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP'
}

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  [DeliveryType.DELIVERY]: 'Livraison',
  [DeliveryType.PICKUP]: 'Retrait sur place'
};
