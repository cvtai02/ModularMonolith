import type {
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

  // Auth: TenantAdminUp.
  // Method: importVariantInventory - imports absolute variant quantities in bulk.
  // Request: src/Modules/Inventory/DTOs/Inventory/ImportVariantInventoryRequest.cs
  // Response: src/Modules/Inventory/DTOs/Inventory/ImportVariantInventoryResponse.cs
  importVariantInventory(input: ImportVariantInventoryRequest): Promise<ImportVariantInventoryResponse>;
}
