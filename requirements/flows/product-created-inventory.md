# Product Created Inventory Flow

1. Admin creates product.
2. ProductCatalog creates product, options, variants, metrics, and shipping data.
3. ProductCatalog adds `ProductCreated` event to the product entity.
4. SaveChanges interceptor publishes `ProductCreated`.
5. Inventory listens to `ProductCreated`.
6. Inventory creates product inventory, variant inventory, and variant tracking rows.
