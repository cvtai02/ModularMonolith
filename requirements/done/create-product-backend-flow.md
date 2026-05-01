# Create Product Backend Flow

## Summary
Backend flow for creating and fully replacing products with options, variants, pricing, shipping, media, and inventory initialization. This document is for backend/API behavior and contract context.

## Entity Relationships & Data Model

### Primary Entities

**ProductCatalog Module:**
- `Product` - Root entity with general info, pricing defaults, inventory defaults
- `Option` - Product options (e.g., Color, Size) - max 2 per product
- `OptionValue` - Values for each option (e.g., "Red", "Blue" for Color)
- `Variant` - Product variant combining option values (generated automatically)
- `VariantOptionValue` - Mapping between variant and option values
- `ProductMedia` - Attached media files
- `ProductMetric` - Analytics (Stock, Sold, Rating)
- `ProductShipping` - Product-level shipping template

**Inventory Module:**
- `ProductInventory` - Product-level inventory settings (TrackInventory, AllowBackorder, LowStockThreshold)
- `VariantInventory` - Variant-level inventory settings (overrides product defaults if UseProductInventory=false)
- `VariantTracking` - Real-time stock quantities

### Data Flow on Creation

```
Product (general info, pricing, inventory defaults)
  ├─ ProductShipping (template for variants)
  ├─ ProductMedia (uploaded files)
  ├─ Option[1..2] (product attributes)
  │   └─ OptionValue[n] (attribute values)
  ├─ Variant[n] (auto-generated or manual)
  │   ├─ VariantShipping (copy of ProductShipping initially)
  │   ├─ VariantMetric
  │   └─ VariantOptionValue[n]
  └─ ProductInventory
      ├─ TrackInventory
      ├─ AllowBackorder
      └─ LowStockThreshold
```

---

## API Integration

### Shared API Types

Import aliases from `src/clients/shared/api/api-types.ts`.

**ProductCatalog:**
- `GET /api/ProductCatalog/categories`
  - Query: `ListCategoriesQuery`.
  - Response: `ListCategoriesResponse`.
- `POST /api/ProductCatalog/products`
  - Request: `CreateProductRequest`.
  - Response: `CreateProductResponse`.
- `GET /api/ProductCatalog/products`
  - Query: `ListProductsQuery`.
  - Response: `ListProductsResponse`.
- `GET /api/ProductCatalog/products/{id}`
  - Path params: `GetProductParams`.
  - Response: `ProductResponse`.
- `PUT /api/ProductCatalog/products/{id}`
  - Path params: `UpdateProductParams`.
  - Request: `UpdateProductRequest`.
  - Response: `UpdateProductResponse`.
  - Behavior: full-replace update. Send the same complete product shape as create.

**Content uploads:**
- `POST /api/Content/file-objects/presigned-upload`
  - Request: `GetPresignedUploadBulkUrlRequest`.
  - Response: `PresignedUploadBulkUrlResponse`.
- `POST /api/Content/file-objects/confirm-upload`
  - Request: `ConfirmUploadRequest`.
  - Response: `ConfirmUploadResponse`.

**Inventory:**
- `POST /api/Inventory/products/{productId}/initialize`
  - Path params: `InitializeProductInventoryParams`.
  - Request: `InitializeProductInventoryRequest`.
  - Response: `InitializeProductInventoryResponse`.

### Shared Type Properties

`ProductStatus` values:
- `Active`
- `Draft`
- `Unlisted`

`Currency` values:
- `VND`
- `USD`

DTO-backed ProductCatalog types:
- `CreateProductRequest`, `CreateProductMediaRequest`, and `CreateProductOptionRequest`: [CreateProductRequest.cs](../../src/Modules/ProductCatalog/DTOs/Products/CreateProductRequest.cs)
- `UpdateProductRequest`: [UpdateProductRequest.cs](../../src/Modules/ProductCatalog/DTOs/Products/UpdateProductRequest.cs). This currently inherits the full create shape; use it as a complete replacement payload, not a partial patch.
- `CreateVariantRequest`: [CreateVariantRequest.cs](../../src/Modules/ProductCatalog/DTOs/Products/CreateVariantRequest.cs)
- `CreateProductResponse`, `UpdateProductResponse`, `ProductResponse`, and `ProductMediaResponse`: [ProductResponse.cs](../../src/Modules/ProductCatalog/DTOs/Products/ProductResponse.cs)
- `OptionResponse`: [OptionResponse.cs](../../src/Modules/ProductCatalog/DTOs/Products/OptionResponse.cs)
- `VariantResponse` and `VariantOptionValueDto`: [VariantResponse.cs](../../src/Modules/ProductCatalog/DTOs/Products/VariantResponse.cs)

`InitializeProductInventoryParams`:
- `productId: number`

DTO-backed Inventory types:
- `InitializeProductInventoryRequest` and `VariantInventoryConfig`: [InitializeProductInventoryRequest.cs](../../src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryRequest.cs)
- `InitializeProductInventoryResponse` and `VariantInventoryResponse`: [InitializeProductInventoryResponse.cs](../../src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryResponse.cs)

DTO-backed Content upload types:
- `GetPresignedUploadBulkUrlRequest`, `PresignedUploadBulkUrlResponse`, `ConfirmUploadRequest`, and `ConfirmUploadResponse`: see [file-upload-media-plan.md](file-upload-media-plan.md).

### Existing API Check

Current AppHost OpenAPI paths expose these relevant endpoints:

- `GET /api/ProductCatalog/categories`
- `GET /api/ProductCatalog/categories/{name}`
- `POST /api/ProductCatalog/products`
- `GET /api/ProductCatalog/products`
- `GET /api/ProductCatalog/products/{id}`
- `PUT /api/ProductCatalog/products/{id}`
- `POST /api/Inventory/products/{productId}/initialize`
- `POST /api/Content/file-objects/presigned-upload`
- `POST /api/Content/file-objects/confirm-upload`

Important contract notes from the current backend:

- ProductCatalog and Content route casing is currently `ProductCatalog` and `Content` in OpenAPI, not lowercase `productcatalog` / `content`.
- `POST /api/ProductCatalog/products` currently owns product creation and persists product, options, variants, media, pricing, inventory flags, and variant shipping.
- `PUT /api/ProductCatalog/products/{id}` uses `UpdateProductRequest` and replaces the product, options, variants, shipping, and inventory configuration from the submitted payload.
- `POST /api/Inventory/products/{productId}/initialize` initializes product and variant inventory records.
- Product media payload supports `MediaKeys: string[]` for storage keys from content upload.
- Update replaces `ProductMedia` rows from the submitted `MediaKeys`, `Medias`, or fallback `ImageUrl` payload. Omitted media means existing media is removed.
- Variant option payload uses `OptionValues: [{ OptionId, OptionName, Value }]`; `OptionId` can be `null` during creation.
- `CreateProductRequest` includes `Stock`, `TrackInventory`, `LowStockThreshold`, and `AllowBackorder`, but only `TrackInventory` and `AllowBackorder` are persisted on ProductCatalog entities today. Response `LowStockThreshold`, variant `Stock`, and variant `Reserved` currently map to `0`.
- Product-level shipping is accepted in the request as `PhysicalProduct`, `Weight`, `Width`, `Height`, and `Length`.

### Endpoints Used

**ProductCatalog Module:**
1. `GET /api/ProductCatalog/categories` - fetch categories for dropdown
2. `POST /api/ProductCatalog/products` - create product with all nested data
   - Payload includes: general info, options, variants, pricing, shipping
   - Backend handles ProductInventory & VariantInventory creation via Inventory API
3. `PUT /api/ProductCatalog/products/{id}` - update product with a complete replacement payload
   - Payload uses `UpdateProductRequest`; include general info, options, variants, pricing, shipping, media, and inventory fields.

**Content Module:**
1. `POST /api/Content/file-objects/presigned-upload` - get upload URLs
2. `POST /api/Content/file-objects/confirm-upload` - confirm file upload

**Inventory Module (Direct API call from Backend):**
- Backend calls single Inventory API after creating Product:
  - `POST /api/Inventory/products/{productId}/initialize` - Create ProductInventory + all VariantInventory records in one call
- Frontend does NOT call Inventory API directly (handled by ProductCatalog backend)

### Create Product Request Structure

DTO-backed request structures:
- `CreateProductRequest`: [CreateProductRequest.cs](../../src/Modules/ProductCatalog/DTOs/Products/CreateProductRequest.cs)
- `UpdateProductRequest`: [UpdateProductRequest.cs](../../src/Modules/ProductCatalog/DTOs/Products/UpdateProductRequest.cs)
- `CreateVariantRequest` and `VariantOptionValueDto`: [CreateVariantRequest.cs](../../src/Modules/ProductCatalog/DTOs/Products/CreateVariantRequest.cs)
- `InitializeProductInventoryRequest` and `VariantInventoryConfig`: [InitializeProductInventoryRequest.cs](../../src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryRequest.cs)

---

## Backend Validation And Behavior

### Server-Side Validation

- Category exists
- Slug uniqueness
- Option values valid for variant combinations
- Currency enum validation
- Status enum validation
- All required nested data present
- Media keys correspond to valid uploads

---

## Business Logic

### Variant Generation

When options change, automatically regenerate variants:

```
if (options.length === 0) {
  variants = [{ defaultVariant }];
} else if (options.length === 1) {
  variants = options[0].values.map(val => ({ [options[0].name]: val }));
} else if (options.length === 2) {
  variants = cartesian(options[0].values, options[1].values);
  // Result: all combinations of option 1 × option 2
}

// New variants inherit:
- Product pricing if useProductPricing = true
- Product shipping if useProductShipping = true
- Product inventory defaults if useProductInventory = true
```

### Inventory Sync

**Backend Flow (ProductCatalog -> Inventory Module):**
1. `POST /api/ProductCatalog/products` or `PUT /api/ProductCatalog/products/{id}` is received
2. ProductCatalog backend creates Product & Variants
3. ProductCatalog backend calls Inventory API (single endpoint):
   - `POST /api/Inventory/products/{productId}/initialize` with:
     - ProductInventory settings (TrackInventory, AllowBackorder, LowStockThreshold)
     - Array of VariantInventory configs for each variant (VariantId, UseProductInventory, and variant-specific settings)
4. Inventory API:
   - Creates ProductInventory record
   - Creates VariantInventory record for each variant
   - Initializes VariantTracking.Quantity = 0 for each variant
5. Response includes all created records

### Media Handling

1. Upload media via presigned URL (Content module)
2. Store file keys in ProductMedia records
3. Variants can have their own image URL or inherit product image

### Profit/Margin Calculation

```
Profit = Price - CostPrice (only if CostPrice > 0)
Margin = (Profit / Price) × 100% (as percentage)

Example:
- Price: 100,000 VND
- CostPrice: 60,000 VND
- Profit: 40,000 VND
- Margin: 40%
```
## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.
