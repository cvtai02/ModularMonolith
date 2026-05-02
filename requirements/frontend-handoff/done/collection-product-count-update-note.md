# Collection Product Count Update Note

Claude owns the admin frontend implementation for this follow-up.

## Change

Collection responses now include `productCount`, the number of products currently assigned to the collection.

## API Client

Use the Product Catalog client contract:

- `src/clients/shared/api/contracts/productcatalog.ts`

Client methods to use:

- `listCollection(query)` for the collections index table.
- `getCollection(id)` if the collection detail/edit page needs the count.
- `createCollection(input)`, `updateCollection(collectionId, input)`, and `addCollectionProducts(collectionId, { productIds })` will also return the updated count.

## API Behavior

- `productCount` is returned on collection list items.
- `productCount` is returned on collection detail.
- `productCount` is returned after create, update, and add-products mutations.
- The count reflects current collection-product assignments.

## Frontend UX

- Display `collection.productCount` in the collections index table as a Products column.
- Use a plain number or a small badge consistent with the admin table style.
- Refresh/invalidate collection queries after collection product mutations so the count stays current.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.
