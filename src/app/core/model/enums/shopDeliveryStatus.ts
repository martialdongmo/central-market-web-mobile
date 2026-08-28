export enum ShopDeliveryStatus {
  PENDING = 'PENDING',              // ShopOrder created, shop has not acted yet
  CONFIRMED = 'CONFIRMED',          // Shop accepted and will fulfill
  PREPARING = 'PREPARING',          // Shop is packing / preparing items
  READY_FOR_PICKUP = 'READY_FOR_PICKUP', // Items packed, waiting for driver pickup
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', // Items have left the shop
  DELIVERED = 'DELIVERED',          // Customer received the items
  FAILED = 'FAILED',                // Delivery attempt failed
  CANCELED = 'CANCELED'             // Shop canceled their part
}
