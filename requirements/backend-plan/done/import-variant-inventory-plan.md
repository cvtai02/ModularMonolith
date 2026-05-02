# Import Variant Inventory Backend Plan

## Status

Implemented.

## Summary

Inventory now supports importing variant inventory quantities in bulk through a structured JSON request.

The import uses absolute quantity replacement, validates the whole request before applying changes, preserves reserved quantities, creates missing variant inventory/tracking records when needed, and writes adjustment transactions for changed rows.

No schema migration was required because the feature uses existing `VariantInventory`, `VariantTracking`, and `Transaction` tables.
