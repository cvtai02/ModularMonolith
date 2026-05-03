import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  AdminCreateOrderRequest,
  AdminCreateOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetAdminOrderByIdResponse,
  ListAdminOrdersQuery,
  ListAdminOrdersResponse,
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
  private readonly fetch: Fetch;
  private readonly apiBaseUrl: string;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.fetch = fetch;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
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

  async adminCreateOrder(input: AdminCreateOrderRequest): Promise<AdminCreateOrderResponse> {
    return this.requestJson<AdminCreateOrderResponse>(
      "/api/Order/orders/admin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Admin create order response was empty.",
    );
  }

  async listAdminOrders(query?: ListAdminOrdersQuery): Promise<ListAdminOrdersResponse> {
    return this.requestJson<ListAdminOrdersResponse>(
      `/api/Order/orders/admin${this.toQueryString(query)}`,
      undefined,
      "Admin orders response was empty.",
    );
  }

  async getAdminOrderById(id: number): Promise<GetAdminOrderByIdResponse> {
    return this.requestJson<GetAdminOrderByIdResponse>(
      `/api/Order/orders/admin/${id}`,
      undefined,
      "Admin order response was empty.",
    );
  }

  private async requestJson<T>(path: string, init: RequestInit | undefined, emptyMessage: string): Promise<T> {
    const response = await this.fetch(`${this.apiBaseUrl}${path}`, init);
    if (!response.ok) {
      throw await this.readError(response);
    }

    const data = await response.json() as T | undefined;
    return requireData(data, emptyMessage);
  }

  private toQueryString(query?: object): string {
    if (!query) {
      return "";
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    }

    const value = params.toString();
    return value ? `?${value}` : "";
  }

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
