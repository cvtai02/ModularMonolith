import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, QueryParams } from "./path-type-helpers";

// -- API Types --
type OrderPaths = paths; // do not export this

type ListOrdersOperation =
    OrderPaths["/api/Order/orders"]["get"];
type CreateOrderOperation =
    OrderPaths["/api/Order/orders"]["post"];
type GetOrderOperation =
    OrderPaths["/api/Order/orders/{code}"]["get"];

export type ListOrdersQuery = QueryParams<ListOrdersOperation>;
type GeneratedListOrdersResponse = JsonResponse<ListOrdersOperation>;
type GeneratedOrderResponse = JsonResponse<GetOrderOperation>;
type GeneratedCreateOrderRequest = JsonRequestBody<CreateOrderOperation>;
// 200 OK
export type ListOrdersResponse = Omit<GeneratedListOrdersResponse, "items"> & {
    items: OrderSummaryResponse[];
};
export type CreateOrderRequest = GeneratedCreateOrderRequest & {
    paymentProvider?: string | null;
};
// 202 Accepted
export type CreateOrderResponse = OrderResponse;
export type GetOrderParams = { code: string };
// 200 OK
export type OrderResponse = Omit<GeneratedOrderResponse, "id" | "inventoryReservationId" | "paymentProvider"> & {
    code: string;
    paymentProvider: string;
};

export type OrderSummaryResponse = Omit<GeneratedOrderResponse, "id" | "inventoryReservationId" | "shippingAddress" | "lines" | "paymentProvider"> & {
    code: string;
    paymentProvider: string;
    lineCount: number;
    createdAt: string;
};

export type AdminCreateOrderRequest = CreateOrderRequest & {
    customerProfileId?: number | null;
};

export type AdminCreateOrderResponse = CreateOrderResponse;
export type ListAdminOrdersQuery = ListOrdersQuery;
export type ListAdminOrdersResponse = ListOrdersResponse;
export type GetAdminOrderByCodeResponse = OrderResponse;
