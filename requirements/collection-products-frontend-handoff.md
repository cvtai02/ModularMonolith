# Collection Products Frontend Handoff

Claude owns the admin frontend implementation for this feature.

## Goal

Add UI support for assigning products to collections.

The backend now supports:

- creating a collection with initial products
- adding products to an existing collection
- replacing products while updating an existing collection

After frontend implementation, move this file to `requirements/done/` with a short completion summary.

## API Behavior

- `title` is required for create.
- `slug` must be unique.
- `productIds` must contain positive integers.
- nonexistent product IDs return validation errors.
- duplicate product IDs are ignored by backend.
- adding products already in the collection is idempotent.
- on update, omitting `productIds` leaves collection products unchanged.
- on update, sending `productIds: []` clears all assigned products.
- on update, sending `productIds: [1, 2]` replaces assignments in that order.

## Frontend UX

On create collection:

- Add a product picker section to the create collection form.
- Let the user search/select multiple products before submit.
- Submit selected product IDs as `productIds` in `createCollection`.
- Keep collection fields and product picker in the same create flow.

On existing collection detail/edit:

- Show products currently assigned to the collection if the current API/UI already has enough data for it.
- Add an "Add products" action that opens a product picker.
- Submit selected IDs with `addCollectionProducts(collectionId, { productIds })`.
- For a full edit/save screen, send the selected product list as `productIds` in `updateCollection`.
- Refresh/invalidate collection-related queries after success.

Product picker expectations:

- Use the existing product list API/client if available.
- Support search.
- Show enough product context to distinguish products: name, image if available, price/status if already present in shared product response.
- Prevent selecting the same product twice in the local picker.
- Disable submit when no product is selected.

## Notes

The backend currently returns the existing `CollectionResponse` shape after create/add/update. It does not yet include a full product list inside `CollectionResponse`, so if the UI needs to display assigned products and no endpoint already exposes them, document the missing backend response requirement instead of inventing frontend-only state as the source of truth.
