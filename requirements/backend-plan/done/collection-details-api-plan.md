# Collection Details API Backend Plan

## Status

Implemented.

## Summary

Collection detail now returns assigned product summaries while collection list remains lightweight.

The `getCollection(id)` response includes collection metadata, `productCount`, and ordered `products`.

Each assigned product summary includes product id, name, slug, image URL, status, price, currency, and collection display order.

No schema migration was required because the response derives data from existing `CollectionProducts` and `Products` rows.
