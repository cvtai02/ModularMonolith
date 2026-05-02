# Collection Product Count Backend Plan

## Status

Implemented.

## Summary

Collection responses now expose `ProductCount`, serialized as `productCount`, so the admin frontend can show how many products are assigned to each collection.

The count is populated for collection list, detail, create, update, and add-products responses.

No schema migration was required because the value is derived from existing `CollectionProducts` rows.
