# Backend Security And Product Variant Fixes

1. Customer creates an order.
2. Customer can only view their own orders.
3. Admin can view all orders.
4. Checkout can only be created for an order owned by the authenticated customer.
5. Admin-only product catalog and inventory writes require `TenantAdminUp`.
6. Product create validates variant option values against defined product option values.
7. Product update can reorder/add option values and add matching new variants.
8. Reservation expiry publishes through the event bus abstraction.
