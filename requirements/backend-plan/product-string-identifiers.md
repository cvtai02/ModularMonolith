# Product String Identifiers

## Goal

Change ProductCatalog product ids and variant ids from integer ids to string ids. Admin can provide ids explicitly; if omitted, backend generates stable ids.

## Scope

- ProductCatalog product and variant entities/DTOs/routes use string identifiers.
- Product update cannot edit options or remove/rebuild variants through option changes.
- Product update can add new option values to existing options.
- Inventory, ordering, and shared API contracts use string product/variant ids where they refer to ProductCatalog products/variants.

## Validation

- Product id and variant id must be non-empty when provided.
- Generated ids must be unique.
- Update product rejects option edits/removals.
- Update product accepts new option values for existing options.

## Migration Handoff

EF migrations are required for ProductCatalog, Inventory, and Order references. Codex must not run migration commands.
