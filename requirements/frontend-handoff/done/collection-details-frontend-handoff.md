# Collection Details Frontend Handoff

Claude owns the admin frontend implementation for this feature.

## Change

Collection detail now returns assigned product summaries in addition to collection metadata and `productCount`.

## API Client

Use the Product Catalog client contract:

- `src/clients/shared/api/contracts/productcatalog.ts`

Client method to use:

- `getCollection(id)` for loading collection detail and assigned products.

## API Behavior

- Existing collection detail returns collection metadata.
- Existing collection detail returns `productCount`.
- Existing collection detail now also returns `products`.
- `products` is an empty list when the collection has no assigned products.
- Product items preserve collection display order.
- Missing collection id still returns not found behavior.

## Frontend UX

- Use `collection.products` as the source of truth for assigned products on the collection detail/edit page.
- Display assigned products in the same order returned by the API.
- Product rows can show name, image, status, price, currency, and display order when useful.
- Stop relying on local-only selected product state after loading an existing collection.
- Continue invalidating/refetching collection detail after add/update collection product mutations.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.
