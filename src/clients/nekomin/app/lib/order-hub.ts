export const ORDER_HUB_URL = "/hubs/orders";

export type OrderNotificationType = "OrderPlaced" | "OrderRejected" | "OrderPaid" | string;

export type OrderNotification = {
  type: OrderNotificationType;
  orderCode: string;
  status: string;
  reservationId?: number | null;
  rejectionReason?: string | null;
  occurredAt: string;
};

export function notificationKey(n: OrderNotification): string {
  return `${n.type}:${n.orderCode}:${n.status}:${n.occurredAt}`;
}

export function notificationMessage(n: OrderNotification): string {
  switch (n.type) {
    case "OrderPlaced":
      return `Order #${n.orderCode} placed — inventory reserved.`;
    case "OrderRejected":
      return n.rejectionReason
        ? `Order #${n.orderCode} rejected: ${n.rejectionReason}`
        : `Order #${n.orderCode} was rejected.`;
    case "OrderPaid":
      return `Order #${n.orderCode} payment confirmed.`;
    default:
      return `Order #${n.orderCode} updated (${n.status}).`;
  }
}
