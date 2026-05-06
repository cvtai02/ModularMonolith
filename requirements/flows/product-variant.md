1. Admin click Create Product
2. Create Product:
   - Validate product name / slug / category / media
   - Validate options
   - Validate variants
   - If product has options but no variants -> return 400 ValidationProblemDetails
   - If product has no options but more than one variant -> return 400 ValidationProblemDetails
   - If variant option values don't match product options -> return 400 ValidationProblemDetails
   - If duplicate variant combination -> return 400 ValidationProblemDetails
   - If compare-at price < price -> return 400 ValidationProblemDetails
3. Save Product base info
4. Create Product Options
5. Create Product Variants:
   - If no variants provided -> create one default variant from product pricing/inventory/shipping
   - If variants provided -> create each variant with price, compare-at price, cost, tax, SKU/barcode, media
6. Create Variant Option Values:
   - Link each variant to its selected option values
7. Create Variant Shipping:
   - Use variant shipping input if provided
   - Otherwise use product shipping defaults
8. Create Variant Inventory:
   - Create VariantInventory for each variant
   - Create VariantTracking for each variant
   - Apply trackInventory / allowBackorder / lowStockThreshold
9. Save changes
10. Return ProductResponse with variants, option values, shipping, and inventory summary

Update Product callback:

Admin update product
-> load existing product
-> validate product / options / variants
-> delete old variants, option values, variant shipping, variant metrics
-> delete old variant inventory / tracking
-> recreate variants from request
-> recreate variant inventory / tracking
-> save changes
-> return updated ProductResponse
