import type {
  ImportVariantInventoryRequest,
  ImportVariantInventoryResponse,
  InitializeProductInventoryRequest,
  InitializeProductInventoryResponse,
} from "../types/inventory";

export * from "../types/inventory"

export interface IInventoryClient {
  // Request: src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryRequest.cs
  // Response: src/Modules/Inventory/DTOs/Inventory/InitializeProductInventoryResponse.cs
  initializeProductInventory(
    productId: number,
    input: InitializeProductInventoryRequest,
  ): Promise<InitializeProductInventoryResponse>;

  // Method: importVariantInventory - imports absolute variant quantities in bulk.
  // Request: src/Modules/Inventory/DTOs/Inventory/ImportVariantInventoryRequest.cs
  // Response: src/Modules/Inventory/DTOs/Inventory/ImportVariantInventoryResponse.cs
  importVariantInventory(input: ImportVariantInventoryRequest): Promise<ImportVariantInventoryResponse>;
}
