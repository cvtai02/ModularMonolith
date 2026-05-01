import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  ListOrdersQuery,
  ListOrdersResponse,
  OrderResponse,
} from "../types/order";
import type { IOrderClient } from "../contracts/order";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class OrderClient implements IOrderClient {
  private readonly client: OpenApiClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { data, error } = await this.client.POST("/api/Order/orders", { body: input });
    if (error) throw error;
    return requireData(data, "Create order response was empty.");
  }

  async getOrderById(id: number): Promise<OrderResponse> {
    const { data, error } = await this.client.GET("/api/Order/orders/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Order response was empty.");
  }

  async listOrders(query?: ListOrdersQuery): Promise<ListOrdersResponse> {
    const { data, error } = await this.client.GET("/api/Order/orders", { params: { query } });
    if (error) throw error;
    return requireData(data, "Orders response was empty.");
  }
}
