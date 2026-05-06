import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  CreatePaymentCheckoutRequest,
  CreatePaymentCheckoutResponse,
  ListPaymentMethodsResponse,
  PaymentTransactionResponse,
  PaymentWebhookRequest,
  PaymentWebhookResponse,
} from "../types/payment";
import type { IPaymentClient } from "../contracts/payment";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class PaymentClient implements IPaymentClient {
  private readonly client: OpenApiClient;
  private readonly fetch: Fetch;
  private readonly apiBaseUrl: string;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.fetch = fetch;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async listPaymentMethods(): Promise<ListPaymentMethodsResponse> {
    const { data, error } = await this.client.GET("/api/Payment/methods");
    if (error) throw error;
    return requireData(data, "Payment methods response was empty.");
  }

  async createCheckout(
    orderCode: string,
    input: CreatePaymentCheckoutRequest,
  ): Promise<CreatePaymentCheckoutResponse> {
    return this.requestJson<CreatePaymentCheckoutResponse>(
      `/api/Payment/orders/${encodeURIComponent(orderCode)}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Create payment checkout response was empty.",
    );
  }

  async getTransactionById(id: number): Promise<PaymentTransactionResponse> {
    return this.requestJson<PaymentTransactionResponse>(
      `/api/Payment/transactions/${id}`,
      undefined,
      "Payment transaction response was empty.",
    );
  }

  async handleWebhook(provider: string, input: PaymentWebhookRequest): Promise<PaymentWebhookResponse> {
    return this.requestJson<PaymentWebhookResponse>(
      `/api/Payment/webhooks/${encodeURIComponent(provider)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Payment webhook response was empty.",
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

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
