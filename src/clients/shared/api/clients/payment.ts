import createFetchClient, { Client } from "openapi-fetch";
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

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async listPaymentMethods(): Promise<ListPaymentMethodsResponse> {
    const { data, error } = await this.client.GET("/api/Payment/methods");
    if (error) throw error;
    return requireData(data, "Payment methods response was empty.");
  }

  async createCheckout(
    orderId: number,
    input: CreatePaymentCheckoutRequest,
  ): Promise<CreatePaymentCheckoutResponse> {
    const { data, error } = await this.client.POST("/api/Payment/orders/{orderId}/checkout", {
      params: { path: { orderId } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Create payment checkout response was empty.");
  }

  async getTransactionById(id: number): Promise<PaymentTransactionResponse> {
    const { data, error } = await this.client.GET("/api/Payment/transactions/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Payment transaction response was empty.");
  }

  async handleWebhook(provider: string, input: PaymentWebhookRequest): Promise<PaymentWebhookResponse> {
    const { data, error } = await this.client.POST("/api/Payment/webhooks/{provider}", {
      params: { path: { provider } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Payment webhook response was empty.");
  }
}
