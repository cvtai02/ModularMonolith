# Customer Product Catalog

1. Customer opens category, collection, or product list.
2. Backend returns storefront-safe public data only.
3. Category list/detail returns active categories only.
4. Collection detail returns only active products in active categories.
5. Product list/detail returns only active products in active categories.
6. Staff/admin catalog read endpoints remain available behind `TenantModeratorUp`.
