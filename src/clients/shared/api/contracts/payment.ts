import type {
  CreatePaymentCheckoutRequest,
  CreatePaymentCheckoutResponse,
  ListPaymentMethodsResponse,
  PaymentTransactionResponse,
  PaymentWebhookRequest,
  PaymentWebhookResponse,
} from "../types/payment";

export interface IPaymentClient {
  listPaymentMethods(): Promise<ListPaymentMethodsResponse>;
  createCheckout(orderId: number, input: CreatePaymentCheckoutRequest): Promise<CreatePaymentCheckoutResponse>;
  getTransactionById(id: number): Promise<PaymentTransactionResponse>;
  handleWebhook(provider: string, input: PaymentWebhookRequest): Promise<PaymentWebhookResponse>;
}
