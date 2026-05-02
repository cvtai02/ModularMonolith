import type {
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
}
