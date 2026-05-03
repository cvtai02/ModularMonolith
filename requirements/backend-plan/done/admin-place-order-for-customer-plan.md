# Admin Place Order For Customer Backend Plan

## Goal

Allow tenant admins to place an order on behalf of an existing customer while reusing the current Order module checkout behavior.

This plan is abstract and review-oriented. It describes current API capability, expected feature behavior, module boundaries, validation behavior, and handoff impact. It does not describe implementation steps.

## Current API Capability

The Order module already supports customer order creation through `CreateOrderRequest`.

Current customer order creation:

- accepts currency, shipping address, and line items
- validates item quantity, duplicate variants, supported currency, shipping address, and sellable product variants
- creates an order with `CustomerId` from the current authenticated user
- sets the order to `PendingInventory`
- publishes `OrderSubmitted` so inventory can reserve stock
- transitions to `Placed` after inventory reservation succeeds
- publishes existing order placed/admin notification events after reservation

The Account module already exposes admin customer profile listing and detail APIs.

The Order module does not yet support an admin creating an order for a selected customer.

## Feature Behavior

Admins should be able to create an order for a customer by selecting an existing active customer account profile.

The admin-created order should use the same product, price, currency, shipping address, line item, inventory reservation, and order status behavior as the current customer-created order flow.

The created order should store `CustomerId` as the selected customer profile's `IdentityUserId`, matching the current `Order.CustomerId` meaning.

The admin user should not become the customer on the order. Admin identity is only the actor performing the action.

The request should require a customer profile id, not a free-form customer id string, so the backend can validate that the selected customer exists and is eligible.

The admin-created order should return the normal `OrderResponse`.

## Module Boundaries

Order owns:

- order creation
- order line creation
- total calculation
- order status behavior
- publishing `OrderSubmitted`
- admin order creation endpoint and DTOs

ProductCatalog owns:

- variant lookup for order pricing and sellability through the existing order product lookup abstraction

Inventory owns:

- reservation handling after `OrderSubmitted`

Account owns:

- customer account profile data
- validating that a selected customer profile exists, is active, and has customer type

Intermediary should expose a small customer lookup abstraction so Order can validate customer profile data without directly referencing Account.

Frontend/admin owns:

- customer picker experience
- product/variant picker experience
- shipping address form or customer address selection
- calling the admin place-order API

## API Shape

Add an authenticated tenant-admin endpoint under the Order module.

Preferred route:

- `POST /api/Order/orders/admin`

Request shape should mirror customer order creation and add the selected customer profile:

- `customerProfileId: number`
- `currencyCode?: string | null`
- `shippingAddress: Address`
- `items: { variantId: number; quantity: number }[]`

Response shape:

- existing `OrderResponse`

## Validation Behavior

Admin place-order validation should include:

- request body is required
- `customerProfileId` is positive
- selected customer profile exists
- selected profile is `Customer`
- selected profile is `Active`
- selected profile is not deleted
- supported currency
- shipping address is required
- shipping address required fields are present
- order contains at least one item
- order does not exceed the existing maximum line count
- variant ids are positive and unique
- quantities are greater than zero
- variants exist and are sellable
- variant currency matches request currency

Validation errors should remain grouped by frontend-facing request fields where possible.

## API Client And Handoff Impact

The shared Order API client contract should expose an admin method for placing an order for a customer.

Expected shared client impact:

- `src/clients/shared/api/contracts/order.ts`
- `src/clients/shared/api/types/order.ts`
- `src/clients/shared/api/clients/order.ts`

The admin frontend will also need the Account client to search/select customer profiles.

If frontend work is needed, create a frontend handoff under `requirements/frontend-handoff/` that mentions:

- the Order client contract file path and admin place-order method
- the Account client contract file path and customer profile list/detail methods
- full request and response shapes
- validation behavior
- customer picker, product picker, and shipping address UX expectations

## Migration

No schema migration is expected.

The existing `Order.CustomerId` field can store the selected customer profile's `IdentityUserId`.

If future requirements need audit detail such as `CreatedByAdminId`, `SalesChannel`, or `PlacedBy`, that would require a separate schema plan and migration.
