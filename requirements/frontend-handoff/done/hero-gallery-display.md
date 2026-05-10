# Hero Gallery Display Handoff

Claude, move this file to `requirements/frontend-handoff/done/` after implementation.

## Goal

Display a configured hero gallery on the storefront.

## Backend API

Use the existing Content gallery API. Do not create a new backend API unless the existing gallery response cannot support the UI.

Expected client contract:

- `src/clients/shared/api/contracts/content.ts`

Expected gallery response fields:

- `key`
- `name`
- `items`
- each item has `imageKey`, `displayOrder`, `name`, `note`, `link`

## Frontend Behavior

1. Load the hero gallery by its configured gallery key.
2. Sort/render items by `displayOrder`.
3. Render the gallery as the first-viewport hero visual.
4. Use the first gallery item as the default visible hero slide/item.
5. If there are multiple items, support navigation between hero items.
6. If an item has `link`, make the item CTA/click target navigate to that link.
7. If the gallery is missing or has no images, render a stable fallback hero area without breaking layout.

## Image Rules

- Resolve each `imageKey` using the existing media/CDN URL handling already used by content/product images.
- Keep the hero image inspectable and not overly dark, blurred, or cropped.
- Maintain responsive layout on mobile and desktop.

## Notes

- This is frontend-only unless the current shared content client does not expose the public gallery-by-key method.
- Do not edit backend just to hard-code a hero gallery key.
