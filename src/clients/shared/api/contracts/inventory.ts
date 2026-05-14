import type {
  DeleteProductInventoryResponse,
  ImportVariantInventoryRequest,
  ImportVariantInventoryResponse,
  InitializeProductInventoryRequest,
  InitializeProductInventoryResponse,
} from "../types/inventory";

export * from "../types/inventory"

export interface IInventoryClient {
  // Auth: TenantAdminUp.
  // Request: src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryRequest.cs
  // Response: src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryResponse.cs
  initializeProductInventory(
    productId: string,
    input: InitializeProductInventoryRequest,
  ): Promise<InitializeProductInventoryResponse>;

  // Contract method: deleteProductInventory. Auth: TenantAdminUp. Deletes inventory rows by product id; returns 204/no body.
  deleteProductInventory(productId: string): Promise<DeleteProductInventoryResponse>;

  // Auth: TenantAdminUp.
  // Method: importVariantInventory - imports absolute variant quantities in bulk.
  // Request: src/Modules/Inventory/DTOs/Inventory/ImportVariantInventoryRequest.cs
  // Response: src/Modules/Inventory/DTOs/Inventory/ImportVariantInventoryResponse.cs
  importVariantInventory(input: ImportVariantInventoryRequest): Promise<ImportVariantInventoryResponse>;
}
