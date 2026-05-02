import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  ImportVariantInventoryRequest,
  ImportVariantInventoryResponse,
  InitializeProductInventoryRequest,
  InitializeProductInventoryResponse,
} from "../types/inventory";
import type { IInventoryClient } from "../contracts/inventory";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;
type ImportVariantInventoryPostClient = {
  POST(
    path: "/api/Inventory/variants/import",
    options: { body: ImportVariantInventoryRequest },
  ): Promise<{ data?: ImportVariantInventoryResponse; error?: unknown }>;
};

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

  async importVariantInventory(input: ImportVariantInventoryRequest): Promise<ImportVariantInventoryResponse> {
    const client = this.client as unknown as ImportVariantInventoryPostClient;
    const { data, error } = await client.POST("/api/Inventory/variants/import", {
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Import variant inventory response was empty.");
  }
}
