## Page Layout & Behavior

**Layout:**
- On page visit: Collapse the sidebar
- 2-Column layout:
  - **Left column:** General → Product Options → Variants (sequential sections)
  - **Right panel:** Pricing → Shipping → Inventory (sticky/fixed, follows scroll)

**Right Panel Visibility Rules:**
- Inventory section: **Hidden** if product has variants AND no variant is selected
  - **Shown** if: no variants OR (has variants AND one is selected)
- Pricing & Shipping: Always visible, but with conditional toggles

**Variant-Specific Toggles (Right Panel):**
- When a variant is selected:
  - Show `Use Product Pricing Info` toggle in Pricing section (default: true, **disabled during creation**)
  - Show `Use Product Shipping Info` toggle in Shipping section (default: true, **disabled during creation**)
  - Allow editing variant-specific values only if toggles are OFF


## Info Sections

### 1. General (Left Column)
**Fields:**
- `Title` (text input, required, max 255 chars) → Product.Name
- `Category` (dropdown, required) → Product.CategoryId + CategoryName
- `Description` (textarea, optional) → Product.Description
- `Brand` (text input, optional) → Product.Brand
### 2. Product Options (Left Column)
**Constraints:**
- Maximum 2 options per product
- Each option has Name + dynamic list of Values
- If no options: auto-create 1 default variant with no option values

**UI Components:**
- `Add Option` button (disabled when 2 options exist)
- For each option:
  - Option name input (e.g., "Color", "Size", "Material")
  - Dynamic value inputs:
    - Show N filled inputs + 1 empty input at end
    - On input change: if filled, add another empty input below
    - On blur of empty input: if still empty, remove it (keep one empty at end)
    - On blur of filled input: if value matches existing, merge/warn
  - `Delete Option` button (with confirmation)
  - `Done` button (collapse option section)

**Entity Mapping:**
- Option.Name → option name
- OptionValue.Value → each value
- DisplayOrder auto-incremented per option

### 3. Variants (Left Column)
**Auto-Generation:**
- 0 options → 1 default variant (no OptionValues)
- 1 option with N values → N variants
- 2 options (N × M values) → N×M variants
- All new variants inherit product-level:
  - Pricing (UseProductPricing = true)
  - Shipping (UseProductShipping = true)
  - Inventory defaults

**Display & Grouping:**
- If 2+ options: group variants by option combination with selector/tabs
- Each variant row shows:
  - Checkbox (for bulk selection)
  - Option value labels (if any)
  - Image thumbnail (inherited from product or variant-specific)
  - Price (if variant-specific pricing enabled)
  - Stock quantity (if trackable)
  - Edit icon (quick edit)
### 4. Inventory (Right Panel)
**Visibility:** Hidden if has variants and no variant selected; shown otherwise

**Product-Level Fields (Always visible if no variants):**
- `Inventory Tracked` (toggle) → ProductInventory.TrackInventory
- `Allow Backorder` (toggle) → ProductInventory.AllowBackorder
- `Low Stock Threshold` (number, optional) → ProductInventory.LowStockThreshold

**Variant-Level Fields (If variant selected):**
- `Use Product Inventory` (toggle, default: true, **disabled during creation**) → VariantInventory.UseProductInventory
- If toggled off: show variant-specific inventory settings:
  - `Inventory Tracked` (toggle) → VariantInventory.TrackInventory
  - `Quantity` (number input, non-negative, enabled only if Tracked=true) → VariantTracking.Quantity
  - `SKU` (string, optional, unique per variant)
  - `Allow Backorder` (toggle) → VariantInventory.AllowBackorder
  - `Low Stock Threshold` (number, optional) → VariantInventory.LowStockThreshold
- If toggled on: hide variant fields, use product-level values
### 5. Pricing (Right Panel)
**Product-Level Pricing (Always Visible):**
- `Price` (decimal input, required, ≥0) → Product.Price
- `Currency` (dropdown, default: VND) → Product.Currency
- `Compare-at Price` (decimal, optional, ≥ Price) → Product.CompareAtPrice
- `Charge Tax` (toggle) → Product.ChargeTax
- `Cost Price` (decimal, optional, ≥0) → Product.CostPrice
- **Calculated (read-only):**
  - `Profit` = Price - CostPrice (shown if CostPrice > 0)
  - `Margin` = (Profit / Price) × 100% (shown if CostPrice > 0)

**Variant-Specific Pricing (If Variant Selected):**
- `Use Product Pricing Info` (toggle, default: true, **disabled during creation**) → Variant.UseProductPricing
- If toggled off: allow variant to override:
  - Price, CompareAtPrice, CostPrice, ChargeTax
  - Show Profit/Margin recalculation
- If toggled on: variant inherits product pricing (fields disabled/hidden)

**Validation:**
- Price ≥ 0, CompareAtPrice ≥ Price, CostPrice ≥ 0
- Profit/Margin recalculate on any price field change
### 6. Shipping (Right Panel)
**Product-Level Shipping (Always Visible):**
- `Physical Product` (toggle, default: true) → ProductShipping.Physical
- Package dimensions (shown if Physical = true):
  - `Weight` (float input, optional, ≥0, unit: kg) → ProductShipping.Weight
  - `Width` (float input, optional, ≥0, unit: cm) → ProductShipping.Width
  - `Height` (float input, optional, ≥0, unit: cm) → ProductShipping.Height
  - `Length` (float input, optional, ≥0, unit: cm) → ProductShipping.Length

**Variant-Specific Shipping (If Variant Selected):**
- `Use Product Shipping Info` (toggle, default: true, **disabled during creation**) → Variant.UseProductShipping
- If toggled off: allow variant to override:
  - All shipping dimensions (Weight, Width, Height, Length)
- If toggled on: variant inherits product shipping (fields disabled/hidden)

**Behavior:**
- Hide all dimension fields when Physical = false
- All dimension fields: non-negative floats or empty
- On Physical toggle: clear dimensions if set to false
- Update on Product options changes
- New created variants has the same shipping info and Price Info with product
- Group by option if has 2 or more options (selectable) 
- Has checkbox, on one or more checked, show three-dot button that dropdown actions for bulk edit
- Show summary info foreach variant 

4. Inventory