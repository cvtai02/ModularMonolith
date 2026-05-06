# Claude Frontend Handoff: Product And Variant String IDs

## Summary

Backend product and variant identifiers changed from numeric IDs to string IDs.

Admin can now provide `product.id` and each `variant.id` when creating a product. If omitted, backend generates stable IDs. Product update uses the string product ID in the route and no longer allows option/variant editing through the update screen; it only allows adding new option values to existing options.

## Shared Client Files Changed

- `src/clients/shared/api/types/productcatalog.ts`
- `src/clients/shared/api/contracts/productcatalog.ts`
- `src/clients/shared/api/clients/productcatalog.ts`
- `src/clients/shared/api/types/inventory.ts`
- `src/clients/shared/api/contracts/inventory.ts`
- `src/clients/shared/api/clients/inventory.ts`
- `src/clients/shared/api/types/order.ts`

There is no `src/clients/shared/api/api-types.ts` file in this repo. Use the exported aliases from `src/clients/shared/api/contracts/productcatalog.ts`, `src/clients/shared/api/contracts/inventory.ts`, and `src/clients/shared/api/types/order.ts`.

## ProductCatalog Client Methods

Use `IProductCatalogClient` from `src/clients/shared/api/contracts/productcatalog.ts`.

```ts
listProduct(query?: ListProductsQuery): Promise<ListProductsResponse>
getProduct(id: string): Promise<ProductResponse>
createProduct(input: CreateProductRequest): Promise<CreateProductResponse>
updateProduct(id: string, input: UpdateProductRequest): Promise<UpdateProductResponse>
```

Affected endpoints:

- `GET /api/ProductCatalog/products`
- `POST /api/ProductCatalog/products`
- `GET /api/ProductCatalog/products/{id}` where `id` is `string`
- `PUT /api/ProductCatalog/products/{id}` where `id` is `string`

## Product Request Shape

Use `CreateProductRequest` and `UpdateProductRequest` from `src/clients/shared/api/types/productcatalog.ts`.

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
  variants?: CreateVariantRequest[];
};

type CreateVariantRequest = {
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
};

type UpdateProductRequest = CreateProductRequest;
```

Frontend notes:

- Show optional custom ID inputs for product ID and variant ID.
- Product ID max length is 64 characters.
- Variant ID should be treated as a short stable string ID; keep the UI at 64 characters unless backend docs change later.
- If product ID is blank, backend generates one.
- If variant ID is blank, backend generates one.
- Use `imageKey` for variant images, not `imageUrl`.

## Product Response Shape

Use `ProductResponse` and `VariantResponse` from `src/clients/shared/api/types/productcatalog.ts`.

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

type VariantResponse = {
  id: string;
  useProductPricing: boolean;
  useProductShipping: boolean;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  chargeTax: boolean;
  imageUrl: string;
  stock: number;
  sold: number;
  reserved: number;
  trackInventory: boolean;
  lowStockThreshold: number;
  allowBackorder: boolean;
  physicalProduct: boolean;
  weight: number;
  width: number;
  height: number;
  length: number;
  optionValues: Array<{
    optionId?: number | null;
    optionName: string;
    value: string;
  }>;
};
```

## Update Product Behavior

Admin product edit screen must not treat options/variants as fully editable anymore.

Allowed on update:

- Edit base product fields such as name, description, category, status, pricing, media, stock/shipping defaults.
- Add new values to existing options.

Rejected on update:

- Rename an existing option.
- Remove an existing option.
- Remove an existing option value.
- Submit edited/rebuilt variants through `variants`.

Recommended UI behavior:

- Render existing option names as read-only.
- Render existing option values as read-only chips.
- Provide an add-value control per existing option.
- Hide or disable variant editing on the product update screen.
- Use product detail routes keyed by `product.id: string`, not numeric IDs.

## Collections

Collection IDs are still numeric, but products inside collections now use string product IDs.

Use aliases from `src/clients/shared/api/types/productcatalog.ts`:

```ts
type CreateCollectionRequest = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  status?: CollectionStatus;
  productIds?: string[] | null;
};

type AddCollectionProductsRequest = {
  productIds: string[];
};

type UpdateCollectionRequest = {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  status?: CollectionStatus;
  productIds?: string[] | null;
};

type CollectionProductResponse = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  status: ProductResponse["status"];
  price: number;
  currency: ProductResponse["currency"];
  displayOrder: number;
};
```

## Inventory Client

Use `IInventoryClient` from `src/clients/shared/api/contracts/inventory.ts`.

```ts
initializeProductInventory(
  productId: string,
  input: InitializeProductInventoryRequest,
): Promise<InitializeProductInventoryResponse>

importVariantInventory(input: ImportVariantInventoryRequest): Promise<ImportVariantInventoryResponse>
```

Affected endpoints:

- `POST /api/Inventory/products/{productId}/initialize` where `productId` is `string`
- `POST /api/Inventory/variants/import`

Inventory request aliases:

```ts
type InitializeProductInventoryRequest = {
  trackInventory?: boolean;
  allowBackorder?: boolean;
  lowStockThreshold?: number;
  variants?: Array<{
    variantId: string;
    useProductInventory?: boolean;
    trackInventory?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    quantity?: number;
  }>;
};

type ImportVariantInventoryRequest = {
  referenceId?: string | null;
  note?: string | null;
  rows: Array<{
    variantId: string;
    quantity: number;
  }>;
};

type ImportVariantInventoryResponse = {
  totalCount: number;
  appliedCount: number;
  skippedCount: number;
  failedCount: number;
  rows: Array<{
    variantId: string;
    status: string;
    message: string;
    previousQuantity: number;
    newQuantity: number;
  }>;
};
```

## Order Impact

Order line product and variant IDs are string IDs.

Use aliases from `src/clients/shared/api/types/order.ts`:

```ts
type CreateOrderRequest = {
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  customerProfileId?: number | null;
  shippingAddress?: unknown;
};

type OrderResponse = {
  code: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerProfileId?: number | null;
  lines: Array<{
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};
```

Frontend notes:

- Use `variant.id: string` when placing an order.
- Order detail routes are by `code`, not numeric order ID.
- `inventoryReservationId` is removed from shared `OrderResponse`.

## Validation And Error Handling

- Create product returns validation errors when provided product ID or variant ID is empty/duplicate.
- Update product returns validation errors if frontend sends edited variants or option edits/removals.
- IDs are stable business identifiers. Do not parse them as numbers.

## Migration Awareness

Backend entity changes require EF migrations in ProductCatalog, Inventory, and Order modules. Codex did not run migrations or dotnet commands.

## Frontend Implementation — Done

**Shared types** — already correct before this handoff: `product.id: string`, `variant.id: string`, `GetProductParams: {id: string}`, `importVariantInventory` uses `variantId: string`.

**admin/src/configs/routes.ts** — `productDetail` and `productEdit` param narrowed from `number | string` to `string`.

**admin/src/pages/products/view.tsx** — replaced `Number(id)` with `id!` (string); added `enabled: !!productId` guard.

**admin/src/pages/products/edit.tsx** — replaced `Number(id)` with `id!`; removed `variants` from `updateProduct` payload (backend rejects on update); computed `frozenOptionIds` from initial options and passed to `ProductFormLayout`.

**admin/src/pages/products/components/types.ts** — added `customId: string` to `FormValues` and `DEFAULT_FORM_VALUES`.

**admin/src/pages/products/add.tsx** — passes `id: values.customId.trim() || undefined` to `createProduct`; shows custom ID field via `showCustomIdField` prop.

**admin/src/pages/products/components/ProductFormLayout.tsx** — added `frozenOptionIds?: Set<string>` and `showCustomIdField?: boolean` props; renders custom ID input when `showCustomIdField`; hides `VariantsSection` when `frozenOptionIds` is defined (edit mode); passes `frozenOptionIds` to `OptionsSection`.

**admin/src/pages/products/components/OptionsSection.tsx** — handles `frozenOptionIds`: frozen options show name as read-only badge, existing values as read-only chips, only the trailing empty input for adding new values; add-option button hidden in edit mode.

**admin/src/pages/products/components/ImportInventoryDialog.tsx** — `variantId` validated as non-empty string (removed `parseInt`/numeric checks); `variantId` input changed to `type="text"`; payload maps `variantId: r.variantId.trim()`; summary display uses string ID.

**Not implemented** — per-variant custom ID inputs on the add form (would require changes to `VariantOverride`/`buildVariantsPayload`; backend generates IDs if omitted, so this is low priority).
