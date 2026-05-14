# Delete Product Flow

1. Admin opens product management.
2. Admin chooses delete product.
3. Frontend calls delete inventory by product id.
4. Inventory removes product inventory and variant inventory rows.
5. Frontend calls delete product by product id.
6. Product API checks product exists by id.
7. If product does not exist, return 404.
8. Delete product from catalog.
9. ProductCatalog child catalog data is removed by database cascade.
10. Return 204 No Content.
