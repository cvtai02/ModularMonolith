# Import Variant Inventory Frontend Handoff

Claude owns the admin frontend implementation for this feature.

## Change

Inventory now supports importing variant inventory quantities in bulk from structured rows.

The backend expects absolute stock counts, not deltas.

## API Client

Use the Inventory client contract:

- `src/clients/shared/api/contracts/inventory.ts`

Client method to use:

- `importVariantInventory(input)`

## API Behavior

- Request accepts optional `referenceId`, optional `note`, and `rows`.
- Each row contains `variantId` and absolute `quantity`.
- `quantity` must be non-negative.
- `variantId` must be positive.
- Variant IDs must be unique within one import request.
- The import is all-or-nothing: validation errors prevent applying any row.
- Existing variant inventory is updated.
- Missing variant inventory is created with tracking enabled and the imported quantity.
- Reserved quantity is preserved.
- Changed rows write inventory adjustment transactions.
- Response includes total, applied, skipped, and failed counts plus per-row results.

## Frontend UX

- Let staff prepare import rows before submitting.
- Show validation errors by row where possible.
- Treat imported quantity as the final on-hand count.
- Show an import summary after success: total rows, applied rows, skipped rows, failed rows.
- Show each row result with previous quantity and new quantity when available.
- Refresh/invalidate inventory display data after a successful import.

## Notes

This backend accepts structured JSON rows. If the UI starts from CSV/XLSX, parse and validate the file on the admin frontend before calling the API.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.
