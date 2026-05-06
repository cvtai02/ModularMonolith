# Migration Handoff: Product And Variant String Identifiers

Codex did not run `dotnet`, build, restore, or EF migration commands.

## Suggested Migrations

- ProductCatalog: `ProductAndVariantStringIdentifiers`
- Inventory: `InventoryProductAndVariantStringIdentifiers`
- Order: `OrderLineProductAndVariantStringIdentifiers`

## Reason

ProductCatalog product IDs and variant IDs changed from integer identifiers to string business identifiers. Inventory and Order references to those identifiers must also store strings.

## Expected Schema Changes

ProductCatalog:

- `Products.Id`: convert from integer to string/varchar/text primary key.
- `Variants.Id`: convert from integer to string/varchar/text primary key.
- `Variants.ProductId`: convert from integer to string foreign key.
- Product-related foreign keys convert to string:
  - `ProductMedias.ProductId`
  - `ProductMetrics.ProductId`
  - `ProductShippings.ProductId`
  - `Options.ProductId`
  - `CollectionProducts.ProductId`
- Variant-related foreign keys convert to string:
  - `VariantMetrics.VariantId`
  - `VariantOptionValues.VariantId`
  - `VariantShippings.VariantId`

Inventory:

- `ProductInventories.ProductId`: convert to string primary/reference key.
- `VariantInventories.VariantId`: convert to string primary/reference key.
- `VariantTrackings.VariantId`: convert to string reference key.
- `ReservationLines.VariantId`: convert to string reference key.
- `Transactions.VariantId`: convert to string reference key.
- `Batches.VariantId`: convert to string reference key.

Order:

- `OrderLines.ProductId`: convert to string.
- `OrderLines.VariantId`: convert to string.

## Data Notes

Existing numeric IDs cannot be automatically preserved as generated product/variant string IDs without a data-migration decision. If current dev data can be discarded, recreate affected tables or seed fresh data. If data must be preserved, cast existing integer values to strings during migration and then allow new rows to use the generated string IDs.
