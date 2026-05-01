import createFetchClient, { Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  InitializeProductInventoryRequest,
  InitializeProductInventoryResponse,
} from "../types/inventory";
import type { IInventoryClient } from "../contracts/inventory";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class InventoryClient implements IInventoryClient {
  private readonly client: OpenApiClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async initializeProductInventory(
    productId: number,
    input: InitializeProductInventoryRequest,
  ): Promise<InitializeProductInventoryResponse> {
    const { data, error } = await this.client.POST("/api/Inventory/products/{productId}/initialize", {
      params: { path: { productId } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Initialize product inventory response was empty.");
  }
}
