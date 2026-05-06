1. User click Buy
2. Create Order: PendingPayment:
   - If Variant Price is Different -> return 409 ProblemDetails: Price has been changes.
3. Inventory Reserve(OrderId, items)
4. If reserve failed:
   - Cancel Order
   - return 409 ProblemDetails: Out of stock
5. Create Payment: Pending
6. Return checkout/payment URL

Payment callback:

Payment success
-> mark Payment Succeeded
-> mark Order Paid
-> Inventory Commit reservation
-> publish OrderPaidIntegrationEvent

Payment failed / timeout:

Payment failed / expired
-> mark Payment Failed
-> cancel Order
-> Inventory Release reservation