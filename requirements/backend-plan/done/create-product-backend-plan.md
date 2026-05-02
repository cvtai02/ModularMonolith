# Create Product Backend Plan

## Status

Implemented before this plan was written. This file records the reviewed backend capability and module boundaries for future reference.

## Goal

Keep Product Catalog create/update product APIs as the backend source of truth for full product setup: general information, media, options, variants, pricing, inventory policy, and shipping data.

## API Capability

Product Catalog supports:

- creating a complete product in one request
- updating a complete product through a full-replace request
- returning a full product response after create/update
- accepting media storage keys for product media
- creating option definitions and option values
- creating variants from submitted variant definitions
- supporting product-level and variant-level pricing, inventory, and shipping decisions
- coordinating inventory setup for created or updated products

Create and update remain aligned so the admin frontend can treat edit submit as a full product payload, not a partial patch.

## Module Boundaries

Product Catalog owns product identity, category assignment, media references, options, variants, pricing, and shipping dimensions.

Inventory owns product and variant inventory policy, stock, reserved, low-stock threshold, and backorder behavior.

Content/media owns upload and storage confirmation. Product Catalog stores storage keys and exposes public URLs through API responses.

Order consumes product/variant lookup snapshots, including display image URL, price, currency, and sellable status.

## Validation Behavior

The APIs validate required product data, category existence, slug uniqueness, pricing, inventory values, shipping dimensions, option/variant consistency, duplicate variant combinations, and media key normalization.

Validation errors are grouped by frontend-facing request fields where possible.

## Handoff Impact

Frontend work should use the Product Catalog API client contract for creating/updating products, category selection, and product admin workflows.

Future frontend handoffs should live under `requirements/frontend-handoff/`, mention the Product Catalog API client contract path and methods to use, and avoid generated type alias dumps or backend endpoint lists unless explicitly requested.
