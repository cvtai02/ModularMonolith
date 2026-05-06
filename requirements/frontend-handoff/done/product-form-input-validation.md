# Claude Frontend Handoff: Product Form Input Validation

## Completed

Validators and helpers in `helpers.ts`:
- `validateNonNegativeNumber(label)` and `validateRequiredNonNegativeNumber(label)` — rules used by `register("price", { validate })` etc.
- `validateOptions(options)` — option-name uniqueness, max 100 chars, ≥1 value per option, value uniqueness within option (case-insensitive).
- `validateVariantNumerics(variants)` — per-variant numeric quarantine + variant compareAt ≥ variant price.

Field-level validation wired through `register`:
- `name`: required, trim, max 200 (`GeneralSection`).
- `description`: max 2000 (`GeneralSection`).
- `price`: required, ≥ 0, NaN guarded (`PricingCard`).
- `compareAtPrice`: optional, ≥ 0, must be ≥ price (`PricingCard`).
- `costPrice`: optional, ≥ 0 (`PricingCard`).
- `stock`, `lowStockThreshold`: optional, ≥ 0 (`InventoryCard`).
- `weight`, `width`, `height`, `length`: optional, ≥ 0 (`ShippingCard`).
- Option name: max 100 chars (`OptionsSection`).
- `customId`: max 64 (existing).

Submit gating (`ProductFormLayout`):
- `useForm({ mode: "onChange" })` so `formState.isValid` updates live.
- Save and Save draft buttons disabled when `!isValid || isPending`.
- On submit: pending option values are auto-committed, options validated, variants validated, then payload sent.

Edit page tightening (`edit.tsx` + `OptionsSection`):
- New `canAddOption` prop; passed `false` from edit page → "Add option" button hidden.
- Existing option names + values still rendered as read-only chips (`initialValueCount`).
- `VariantOverride` carries `id?: string`; populated from `product.variants[].id` in `initialVariantOverrides`.
- `buildVariantsPayload(variants, hasVariants, { existingOnly: true })` filters payload to variants whose `id` exists, dropping new combos derived from newly-added option values.

Backend error mapping (`FIELD_MAP` in `ProductFormLayout`):
- `PhysicalProduct → isPhysical` (existing)
- `slug` / `Slug → name` (slug is generated from product name).
- Section-level errors (`options`, `variants`, `options.<name>`) fall through to a toast carrying the backend message.

## Known gaps vs handoff

- `imageUrl` / media `url` length limits (handoff says max 2000) not enforced — media edit happens in a separate picker UI.
- Backend `options.<name>` errors are surfaced as toasts only; no per-row inline binding.
- `mediaKeys[]` field on the new request shape not adopted — code still sends `medias[].url`. Not a regression but tracked here for future migration.
- New variants on edit (combos created from new option values) are not user-configurable in the UI — the backend creates them with default settings.

## Summary

Add strong input validation to the admin add-product and edit-product pages. The UI should quarantine invalid inputs locally before submit, show field-level errors, and avoid sending malformed product payloads to the backend.

After implementing, move this file to `requirements/frontend-handoff/done/`.

## Shared API Contract

Use ProductCatalog shared client contracts:

- `src/clients/shared/api/contracts/productcatalog.ts`
- `src/clients/shared/api/types/productcatalog.ts`

Use these aliases:

```ts
CreateProductRequest
CreateProductResponse
UpdateProductRequest
UpdateProductResponse
ProductResponse
VariantResponse
```

Use these client methods:

```ts
productCatalogClient.createProduct(input: CreateProductRequest)
productCatalogClient.updateProduct(id: string, input: UpdateProductRequest)
productCatalogClient.getProduct(id: string)
```

Affected endpoints:

- `POST /api/ProductCatalog/products`
- `PUT /api/ProductCatalog/products/{id}`
- `GET /api/ProductCatalog/products/{id}`

## Create Product Request Shape

Frontend-facing shape:

```ts
type CreateProductRequest = {
  id?: string | null;
  name: string;
  description?: string | null;
  categoryId: number;
  imageUrl?: string | null;
  status?: ProductStatus;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  chargeTax?: boolean;
  currency?: Currency;
  stock?: number;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  physicalProduct?: boolean;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  mediaKeys?: string[];
  medias?: Array<{
    url: string;
    type?: string | null;
    displayOrder?: number;
  }>;
  options?: Array<{
    name: string;
    displayOrder?: number;
    values?: string[];
  }>;
  variants?: Array<{
    id?: string | null;
    useProductPricing?: boolean;
    price?: number | null;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    chargeTax?: boolean | null;
    imageKey?: string | null;
    useProductInventory?: boolean;
    quantity?: number;
    trackInventory?: boolean | null;
    lowStockThreshold?: number | null;
    allowBackorder?: boolean | null;
    useProductShipping?: boolean;
    physicalProduct?: boolean | null;
    weight?: number | null;
    width?: number | null;
    height?: number | null;
    length?: number | null;
    optionValues?: Array<{
      optionId?: number | null;
      optionName: string;
      value: string;
    }>;
  }>;
};

type UpdateProductRequest = CreateProductRequest;
```

## Quarantine Validation Behavior

Quarantine means invalid values stay in the visible form state, but are blocked from the API payload until fixed. Do not silently coerce a bad value into a valid payload if that hides the user's mistake.

Examples:

- User types `-1` in price: keep `-1` visible, show error, disable submit.
- User types text into a numeric field: keep the raw text visible, show error, disable submit.
- User enters duplicate option values: keep the chips/rows visible, mark duplicates, disable submit.
- User leaves optional ID blank: allowed; omit or send `null`.
- User enters spaces around IDs/names/values: trim for validation and payload, but keep reasonable input display behavior.

## Add Product Validation

Required:

- `name`: required, trim, max 200 chars.
- `categoryId`: required, must be a selected category.
- `price`: required, number, `>= 0`.

Optional text limits:

- `id`: optional, max 64 chars.
- `description`: optional, max 2000 chars.
- `imageUrl`: optional, max 2000 chars.
- media `url`: required per media row, max 2000 chars.
- media `type`: optional, max 50 chars.
- option `name`: required when option row exists, max 100 chars.
- variant `id`: optional, max 64 chars.
- variant `imageKey`: optional string.

Numeric fields must be numbers and `>= 0`:

- `price`
- `compareAtPrice`
- `costPrice`
- `stock`
- `lowStockThreshold`
- `weight`
- `width`
- `height`
- `length`
- variant `price`
- variant `compareAtPrice`
- variant `costPrice`
- variant `quantity`
- variant `lowStockThreshold`
- variant `weight`
- variant `width`
- variant `height`
- variant `length`

Price rules:

- Product `compareAtPrice` must be `0`, empty, or `>= price`.
- Variant `compareAtPrice` must be `0`, empty, or `>= variant effective price`.
- Variant effective price is `variant.price ?? product.price`.

Option rules on create:

- Max 2 options.
- Option names must be unique, case-insensitive.
- Each option must have at least one non-empty value.
- Option values must be unique within each option, case-insensitive.
- If options exist, variants are required.
- If no options exist, allow only one default variant.

Variant rules on create:

- Variant IDs must be unique when provided, case-insensitive.
- Each variant must provide exactly one value for every defined option.
- Variant option names must match defined option names.
- Variant combinations must be unique.
- Use `imageKey` for variant image input, not `imageUrl`.

## Edit Product Validation

Use `getProduct(id)` to load current product and `updateProduct(id, input)` to submit.

Edit page must follow backend update restrictions:

- Existing option names are read-only.
- Existing option values are read-only.
- Admin can add new values to existing options.
- Admin cannot add new option names.
- Admin cannot remove existing options.
- Admin cannot remove existing option values.
- Admin can edit existing variants by `variant.id`.
- Admin cannot create new variants from the edit page.
- Admin cannot change variant IDs.
- Admin cannot change variant option combinations.

Recommended edit payload behavior:

- Send edited existing variants in `variants`.
- Send full variant objects with current values plus edits, not sparse partial variant patches.
- Each edited variant must include its existing `id`.
- Keep `optionValues` unchanged if sent; sending no `optionValues` for a variant is also acceptable when editing scalar fields.
- Send `options` containing existing option names and all existing values plus newly added values.
- Do not include unknown option names.
- Do not omit existing option names or existing option values.

Edit page should validate:

- All base product rules above.
- New option values are non-empty after trim.
- New option values do not duplicate existing values, case-insensitive.
- Edited variant IDs exist on the loaded product.
- Edited variant IDs are unique, case-insensitive.
- Edited variant option values are unchanged from `ProductResponse.variants`.
- Edited variant numeric fields follow the same non-negative rules as create.
- Edited variant compare-at price is empty, `0`, or greater than/equal to the edited variant effective price.

## Backend Error Mapping

Backend validation errors can return field keys like:

```ts
id
slug
categoryId
options
options.Color
variants
compareAtPrice
```

Map these into form errors:

- `id`: Product ID field.
- `slug`: Product name field, because slug is generated from name.
- `categoryId`: Category selector.
- `options`: Product options section.
- `options.<name>`: Specific option row.
- `variants`: Variants section.
- `compareAtPrice`: Product compare-at price field.

Keep the backend message visible if the frontend missed a rule.

## Submit Rules

- Disable submit while any quarantined field is invalid.
- Disable submit while request is pending.
- Do not drop invalid rows automatically.
- Do not send negative numeric values.
- Do not send `NaN`.
- Do not send option or variant rows that are only whitespace.
- On success, use returned `ProductResponse.id` as the canonical product ID for navigation.

## Product Response Fields Needed By Edit Page

Use `ProductResponse`:

```ts
type ProductResponse = {
  id: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  slug: string;
  imageUrl: string;
  status: ProductStatus;
  price: number;
  currency: Currency;
  compareAtPrice: number;
  costPrice: number;
  chargeTax: boolean;
  stock: number;
  trackInventory: boolean;
  lowStockThreshold: number;
  allowBackorder: boolean;
  sold: number;
  reserved: number;
  physicalProduct: boolean;
  weight: number;
  width: number;
  height: number;
  length: number;
  medias: Array<{
    id: number;
    url: string;
    type: string;
    displayOrder: number;
  }>;
  options: Array<{
    id: number;
    name: string;
    displayOrder: number;
    values: string[];
  }>;
  variants: VariantResponse[];
};
```

## UX Notes

- Show validation next to the field or row that caused it.
- For section-level errors, show them at the top of that section.
- Use stable row keys for options, option values, media, and variants so validation messages do not jump.
- Keep add/edit product behavior consistent so admin learns one validation model.
