export enum OrderStatus {
    CREATED,
    DRAFF,
    PAYMENT_PENDING,
    PENDING_CONFIRMATION,
    PAID,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    COMPLETED,
    CANCELED,
    FAILED
}

// Labels en français
export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'Créé',
  [OrderStatus.DRAFF]: 'Brouillon',
  [OrderStatus.PAYMENT_PENDING]: 'Paiement en attente',
  [OrderStatus.PENDING_CONFIRMATION]: 'En attente de confirmation',
  [OrderStatus.PAID]: 'Payé',
  [OrderStatus.CONFIRMED]: 'Confirmé',
  [OrderStatus.SHIPPED]: 'Expédié',
  [OrderStatus.DELIVERED]: 'Livré',
  [OrderStatus.COMPLETED]: 'Terminé',
  [OrderStatus.CANCELED]: 'Annulé',
  [OrderStatus.FAILED]: 'Échoué',
};