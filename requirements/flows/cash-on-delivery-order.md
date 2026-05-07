# Cash On Delivery Order Flow

1. User selects `CashOnDelivery` payment method.
2. User creates order with payment provider selection.
3. Order is created as `PendingPayment`.
4. Inventory reserves order items.
5. Frontend creates checkout for the order.
6. Payment creates a `CashOnDelivery` transaction as `Succeeded`.
7. Payment publishes `PaymentSucceeded`.
8. Order marks status as `Placed`.
9. Order publishes `OrderPlaced`.
10. Inventory commits reservation.
11. Admin/customer receive order notifications.

## Sepay

Sepay is exposed as a payment method but checkout/webhook handling is not implemented yet.
