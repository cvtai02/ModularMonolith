# Order Products Summary Flow

## Summary
Order checkout is direct item checkout. The client sends selected variant IDs and quantities to the Order API.

## Flow
- Client submits `POST /api/Order/orders` with currency, shipping address, and order items.
- Order validates variants through ProductCatalog.
- Order snapshots product, variant, price, image, quantity, and address data.
- Order starts as `PendingInventory`.
- Order publishes `OrderSubmitted`.
- Inventory reserves stock and publishes success or rejection.
- On success, Order moves to `Placed` and publishes `OrderPlaced`.
- On rejection, Order moves to `Rejected` with a rejection reason.

## Client Behavior
- Treat `202 Accepted` as submitted, not completed.
- Poll order detail until status is `Placed` or `Rejected`.
- Show confirmation from placed order detail.
- Show inventory rejection reason when rejected.
- Keep payment UI separate from this v1 checkout flow.

## Contract Pointers
- API docs: `src/Modules/Order/Api/api.md`
- DTOs: `src/Modules/Order/DTOs/Orders`
- Shared aliases: `src/clients/shared/api/order-types.ts`

## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.
