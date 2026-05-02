import type {
  CreatePaymentCheckoutRequest,
  CreatePaymentCheckoutResponse,
  ListPaymentMethodsResponse,
  PaymentTransactionResponse,
  PaymentWebhookRequest,
  PaymentWebhookResponse,
} from "../types/payment";

export * from "../types/payment"

export interface IPaymentClient {
  // Item response: src/Modules/Payment/DTOs/PaymentMethodResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/payment.ts.
  listPaymentMethods(): Promise<ListPaymentMethodsResponse>;

  // Request: src/Modules/Payment/DTOs/CreateCheckoutRequest.cs
  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  createCheckout(orderId: number, input: CreatePaymentCheckoutRequest): Promise<CreatePaymentCheckoutResponse>;

  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  getTransactionById(id: number): Promise<PaymentTransactionResponse>;

  // Request: src/Modules/Payment/DTOs/PaymentWebhookRequest.cs
  // Response: src/Modules/Payment/DTOs/PaymentTransactionResponse.cs
  handleWebhook(provider: string, input: PaymentWebhookRequest): Promise<PaymentWebhookResponse>;
}
