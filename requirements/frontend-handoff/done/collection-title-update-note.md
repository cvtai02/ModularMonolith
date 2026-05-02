# Collection Title Update Note

Claude owns the admin frontend implementation for this follow-up.

## Change

Collection title can now be changed through the existing collection update flow.

## API Client

Use the Product Catalog client contract:

- `src/clients/shared/api/contracts/productcatalog.ts`

Client method to use:

- `updateCollection(collectionId, input)`

## API Behavior

- `title` can be sent on update.
- If `title` is omitted, the existing title remains unchanged.
- If `title` is provided as blank or whitespace, the backend returns a validation error.

## Frontend UX

- Make the collection title editable on the edit page.
- Remove the read-only note that says "Title cannot be changed after creation."
- Submit the edited title through the existing update collection save action.
- Keep the create collection title behavior unchanged.

After frontend implementation, move this file to `requirements/frontend-handoff/done/` with a short completion summary.
