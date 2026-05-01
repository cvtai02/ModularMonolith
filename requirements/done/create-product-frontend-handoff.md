# Create Product Frontend Handoff

## Summary
Claude should implement the admin create/edit product experience using the ProductCatalog, Content upload, and generated shared API aliases described here. Backend update is a full-replace operation, not a partial patch.

## Frontend State Management

### Form State Structure

```typescript
interface CreateProductFormState {
  // General
  product: {
    name: string;
    categoryId: number;
    description: string;
    status: ProductStatus;
    medias: MediaFile[];
  };

  // Pricing (Product Level)
  pricing: {
    price: decimal;
    currency: Currency; // default: VND
    compareAtPrice: decimal;
    costPrice: decimal;
    chargeTax: boolean;
    profit?: decimal; // calculated
    margin?: decimal; // calculated
  };

  // Shipping (Product Level)
  shipping: {
    physical: boolean;
    weight: float; // kg
    width: float;  // cm
    height: float; // cm
    length: float; // cm
  };

  // Inventory (Product Level)
  inventory: {
    trackInventory: boolean;
    allowBackorder: boolean;
    lowStockThreshold: number;
  };

  // Options & Variants
  options: Option[];
  variants: VariantFormData[];
  selectedVariantIds: Set<number>; // for bulk edit
}

interface Option {
  id?: number; // undefined for new
  name: string;
  values: string[]; // e.g., ["Red", "Blue", "Green"]
}

interface VariantFormData {
  id?: number;
  optionValues: VariantOptionValue[]; // combination that identifies variant
  useProductPricing: boolean;
  imageKey?: string;
  pricing:{
    chargeTax: boolean;
    costPrice: decimal;
    compareAtPrice: decimal;
    price: decimal;
  },
  inventory: {
    useProductInventory: boolean; // NEW: inherit inventory settings from product
    trackInventory: boolean;
    quantity: number;
    allowBackorder: boolean;
    lowStockThreshold: number;
  };
  shipping: {
    useProductShipping: boolean;
    weight: float;
    width: float;
    height: float;
    length: float;
  };
}

interface VariantOptionValue {
  optionId?: number | null; // null is valid during creation before options are persisted
  optionName: string;
  value: string;
}
```

---

## UI Sections Implementation

### 1. General Section

**Fields:**
- `Title` (string, required, max 255 chars)
- `Category` (select, required) - fetch from ProductCatalog API
- `Description` (textarea, optional)
- `Media Files` (multi-upload)
- `Status` (select: Active/Draft/Unlisted, default: Draft)

**Behavior:**
- Media upload via presigned URLs (Content module API)
- Store file keys after upload confirmation

---

### 2. Product Options Section

**Rules:**
- Maximum 2 options per product
- Each option has Name and dynamic Values
- If no options → auto-create 1 default variant with no option values

**UI Behavior:**
- "Add Option" button (disabled when 2 options exist)
- For each option:
  - Option name input
  - Dynamic value inputs:
    - Show N filled inputs + 1 empty input
    - On blur of empty input: if empty, remove it; if filled, add another empty
    - On delete option: confirm & remove all values
    - "Done" button to collapse option
- Maximum option: 2

**Frontend Logic:**
```
onOptionValueChange(optionIndex, valueIndex, newValue) {
  if (newValue === "" && valueIndex === lastIndex) {
    // Empty last input: do nothing (ready for next value)
  } else if (newValue !== "" && valueIndex === lastIndex) {
    // Filled last input: add new empty input
    addEmptyValueInput(optionIndex);
  } else if (newValue === "" && valueIndex !== lastIndex) {
    // Removed middle value: remove it
    removeValue(optionIndex, valueIndex);
  }
  // Regenerate variants based on new option combinations
  regenerateVariants();
}
```

---

### 3. Variants Section

**Auto-Generation Logic:**
- If 0 options: 1 default variant (no option values)
- If 1 option with N values: N variants
- If 2 options with N and M values: N × M variants
- Variants appear after options are added

**Variant Display:**
- Grouped by option combinations
- If 2+ options, show grouping selector (e.g., "Color: Red / Size: M")
- Checkboxes for bulk selection
- Summary row per variant:
  - Option values display
  - Image thumbnail
  - Price (if using variant pricing)
  - Stock quantity (if trackable)
  - Bulk edit button (appears when ≥1 selected)

**Bulk Edit Actions:**
- Update pricing (price, compareAtPrice, costPrice)
- Update inventory (trackInventory, quantity, allowBackorder)
- Update shipping (weight, dimensions)

**New Variant Initialization:**
- Inherit product-level:
  - Pricing (UseProductPricing = true)
  - Shipping info (UseProductShipping = true)
  - Inventory settings (UseProductInventory = true) - can be toggled off to set variant-specific inventory

---

### 5. Inventory Section (Right Panel)
**Product-Level Fields (Always visible if no variants):**
- `Inventory Tracked` (toggle) - controls if quantity is managed
- `Allow Backorder` (toggle) - Continue Selling When Out of Stock
- `Low Stock Threshold` (number, optional)

**Variant-Level Fields (If variant selected):**
- `Use Product Inventory` (toggle, default: true, disabled during creation) → VariantInventory.UseProductInventory
- `Quantity` (number, integer, non-negative) → VariantTracking.Quantity
- If toggled off: show variant-specific inventory settings:
  - `Inventory Tracked` (toggle) → VariantInventory.TrackInventory
  - `Allow Backorder` (toggle) → VariantInventory.AllowBackorder
  - `Low Stock Threshold` (number, optional) → VariantInventory.LowStockThreshold
- If toggled on: hide variant fields, use product-level values

**Behavior:**
- If variant selected: show Use Product Inventory toggle
- If no variant: show product default inventory settings only
- Quantity only enabled if TrackInventory = true

---

### 4. Pricing Section (Right Panel)

**Product Level (Always visible):**
- `Price` (decimal, required, ≥ 0)
- `Currency` (select, default: VND) - from SharedKernel.Enums.Currency
- `Compare-at Price` (decimal, optional, ≥ Price)
- `Charge Tax` (toggle)
- `Cost Price` (decimal, optional, ≥ 0)
- **Calculated fields (read-only):**
  - `Profit` = Price - CostPrice (if CostPrice > 0)
  - `Margin` = (Profit / Price) × 100% (if CostPrice > 0)

**Variant Level (If variant selected):**
- `Use Product Pricing Info` (toggle, default: true, disabled during creation)
- If toggled off: show variant-specific pricing fields
  - Variant can override product pricing
  - Variant can override tax charge setting

**Validation:**
- Price ≥ 0
- CompareAtPrice ≥ Price (if provided)
- CostPrice ≥ 0 (if provided)
- Profit/Margin recalculate on CostPrice change

---

### 6. Shipping Section (Right Panel)

**Product Level (Always visible):**
- `Physical Product` (toggle, default: true)
- Package dimensions (if Physical = true):
  - `Weight` (float, kg, optional)
  - `Width` (float, cm, optional)
  - `Height` (float, cm, optional)
  - `Length` (float, cm, optional)

**Variant Level (If variant selected):**
- `Use Product Shipping Info` (toggle, default: true, disabled during creation)
- If toggled off: show variant-specific shipping fields

**Validation:**
- All dimensions ≥ 0 (if provided)
- Hidden when Physical = false

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

### Endpoints Used

**ProductCatalog Module:**
1. `GET /api/ProductCatalog/categories` - fetch categories for dropdown
2. `POST /api/ProductCatalog/products` - create product with all nested data
   - Payload includes: general info, options, variants, pricing, shipping
   - Backend handles ProductInventory & VariantInventory creation via Inventory API
3. `PUT /api/ProductCatalog/products/{id}` - update product with a complete replacement payload
   - Payload uses `UpdateProductRequest`; include general info, options, variants, pricing, shipping, media, and inventory fields.
   - Media is full-replace too. Send the complete desired `MediaKeys`/`Medias` set on update, not only newly added images.

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

## Frontend Validation And Behavior

## Validation Rules

### Client-Side Validation

1. **General:**
   - Name: required, max 255
   - Category: required
   - Status: required
   - Description: max 2000

2. **Options:**
   - Max 2 options
   - Option name: required, max 100
   - Option values: each max 100, at least 1 value per option

3. **Variants:**
   - At least 1 variant exists
   - Each variant option combination unique
   - Pricing: price ≥ 0
   - CompareAtPrice ≥ Price (if provided)
   - CostPrice ≥ 0 (if provided)

4. **Inventory:**
   - Quantity: non-negative integer
   - LowStockThreshold: non-negative integer

5. **Shipping:**
   - All dimensions: non-negative floats
   - Weight: non-negative float

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

---

## Page State & Transitions

### Initial State
- Empty form with product-level defaults
- 1 empty option (ready for input)
- 1 default variant (no option values)
- Right panel shows product-level inventory/pricing/shipping
- Inventory section hidden (no variants to select)

### After Options Are Added
- Variants auto-generate based on option combinations
- Variant section shows all generated variants
- Right panel still shows product-level (no variant selected)
- Inventory section remains hidden

### After Variant Selection
- Inventory section appears showing selected variant's settings
- Pricing section shows variant pricing toggles
- Shipping section shows variant shipping toggles
- Bulk edit button visible if ≥1 variant checked

### On Submit
- Validate entire form state
- POST to create product endpoint
- Show loading state
- Redirect to product detail or list on success
- Show error toast on failure

---

## Edge Cases & Special Behaviors

1. **No Options:** Single default variant, no option value display
2. **Variant Deletion:** Not implemented during creation (all generated)
3. **Large Option Sets:** If 100+ variants possible, warn user
4. **Media Reordering:** Drag-to-reorder for display order
5. **Currency Persistence:** Remember selected currency for session
6. **Bulk Edit Deselect:** Click checkbox again to deselect all
7. **Form Dirty State:** Warn before leaving unsaved changes
8. **Concurrent Creation:** Handle race condition on submit

---

## Implementation Checklist

- [ ] Create form state hook/store
- [ ] Build General section component
- [ ] Build Options section with dynamic values
- [ ] Implement variant auto-generation logic
- [ ] Build Variants section with bulk edit
- [ ] Build Inventory section with conditional visibility
- [ ] Build Pricing section with profit/margin calculation
- [ ] Build Shipping section with conditional fields
- [ ] Implement media upload flow
- [ ] Create API integration service
- [ ] Add client-side validation
- [ ] Add form dirty state detection
- [ ] Test variant generation with different option counts
## Claude Completion Note

After implementing this requirement, move this file to `requirements/done/`.


## Update 1/5/2026
USe MediaPickerModal for select images.
