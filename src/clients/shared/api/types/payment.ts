import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams } from "./path-type-helpers";

type PaymentPaths = paths; // do not export this
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof PaymentPaths
        ? TMethod extends keyof PaymentPaths[TPath]
            ? PaymentPaths[TPath][TMethod]
            : never
        : never;

type ListPaymentMethodsOperation =
    Operation<"/api/Payment/methods", "get">;
type CreatePaymentCheckoutOperation =
    Operation<"/api/Payment/orders/{orderId}/checkout", "post">;
type GetPaymentTransactionOperation =
    Operation<"/api/Payment/transactions/{id}", "get">;
type PaymentWebhookOperation =
    Operation<"/api/Payment/webhooks/{provider}", "post">;

export const paymentStatuses = ["Pending", "Succeeded", "Failed", "Cancelled", "Refunded"] as const;
export type PaymentStatus = typeof paymentStatuses[number];

// 200 OK
export type ListPaymentMethodsResponse =
    JsonResponse<ListPaymentMethodsOperation, 200>;

export type CreatePaymentCheckoutParams =
    PathParams<CreatePaymentCheckoutOperation>;
export type CreatePaymentCheckoutRequest =
    JsonRequestBody<CreatePaymentCheckoutOperation>;
// 200 OK
export type CreatePaymentCheckoutResponse =
    JsonResponse<CreatePaymentCheckoutOperation, 200>;

export type GetPaymentTransactionParams =
    PathParams<GetPaymentTransactionOperation>;
// 200 OK
export type PaymentTransactionResponse =
    JsonResponse<GetPaymentTransactionOperation, 200>;

export type PaymentWebhookParams =
    PathParams<PaymentWebhookOperation>;
export type PaymentWebhookRequest =
    JsonRequestBody<PaymentWebhookOperation>;
// 200 OK
export type PaymentWebhookResponse =
    JsonResponse<PaymentWebhookOperation, 200>;
