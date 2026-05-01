import type {
  InitializeProductInventoryRequest,
  InitializeProductInventoryResponse,
} from "../types/inventory";

export interface IInventoryClient {
  initializeProductInventory(
    productId: number,
    input: InitializeProductInventoryRequest,
  ): Promise<InitializeProductInventoryResponse>;
}
