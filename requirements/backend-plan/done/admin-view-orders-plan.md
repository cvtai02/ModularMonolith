# Admin View Orders Backend Plan

## Goal

Allow tenant admins to view customer orders from the admin frontend with an explicit admin API surface.

This plan is abstract and review-oriented. It describes current API capability, expected feature behavior, module boundaries, validation behavior, and frontend handoff impact. It does not describe implementation steps.

## Current API Capability

The Order module already supports:

- creating an order with `CreateOrderRequest`
- getting an order by id
- listing orders with pagination
- filtering the order list by status
- searching orders by order code or customer id

The existing list/detail endpoints currently live directly under:

- `GET /api/Order/orders`
- `GET /api/Order/orders/{id}`

The Order module does not yet expose an explicit admin-only order list/detail API.

## Feature Behavior

Admins should be able to view all tenant orders.

Admin order list should support:

- pagination
- status filtering
- search by order code or customer id
- newest orders first

Admin order detail should show:

- order id and code
- customer id
- order status
- currency and total
- inventory reservation id
- rejection reason when present
- shipping address
- order lines with product, variant, image, unit price, quantity, and subtotal

The customer-facing order detail/list behavior should not accidentally expose all tenant orders to non-admin users. If customer order viewing is needed later, it should use a separate customer-scoped API that only returns the current user's orders.

## Module Boundaries

Order owns:

- admin order list query
- admin order detail query
- order summary and detail DTOs
- admin authorization on order view endpoints

Account owns:

- customer profile display data

The first version can return only the existing `CustomerId` stored on the order. If admin UI needs customer display name/email in the order list, plan that as a separate response enrichment using an Intermediary customer lookup abstraction instead of making Order reference Account directly.

Frontend/admin owns:

- orders table
- filters/search
- order detail page or drawer
- customer display formatting from available response fields

## API Shape

Preferred explicit admin routes:

- `GET /api/Order/orders/admin`
- `GET /api/Order/orders/admin/{id:int}`

Admin list query shape should reuse `ListOrdersRequest`:

- `pageNumber: number`
- `pageSize: number`
- `status?: OrderStatus | null`
- `search?: string | null`

Admin list response shape should reuse paginated `OrderSummaryResponse`.

Admin detail response shape should reuse `OrderResponse`.

The existing non-admin routes should either be protected appropriately or avoided by frontend admin code in favor of the explicit admin routes.

## Validation Behavior

Admin order list validation should include:

- `pageNumber` must be at least 1
- `pageSize` must be between 1 and 200
- `status` must be a valid `OrderStatus` when supplied
- blank search should be treated as no search

Admin order detail behavior:

- positive integer id is required by route constraint
- return `404` when the order does not exist in the current tenant

## API Client And Handoff Impact

The shared Order API client contract should expose explicit admin methods for order viewing.

Expected shared client impact:

- `src/clients/shared/api/contracts/order.ts`
- `src/clients/shared/api/types/order.ts`
- `src/clients/shared/api/clients/order.ts`

Expected methods:

- `listAdminOrders(query)`
- `getAdminOrderById(id)`

If frontend work is needed, create a frontend handoff under `requirements/frontend-handoff/` that mentions:

- `src/clients/shared/api/contracts/order.ts`
- `listAdminOrders(query)`
- `getAdminOrderById(id)`
- full list/detail request and response shapes
- admin UX expectations for table, filters, and detail view

## Migration

No schema migration is expected.
