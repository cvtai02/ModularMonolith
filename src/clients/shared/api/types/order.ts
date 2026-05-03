import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams, QueryParams } from "./path-type-helpers";

// -- API Types --
type OrderPaths = paths; // do not export this

type ListOrdersOperation =
    OrderPaths["/api/Order/orders"]["get"];
type CreateOrderOperation =
    OrderPaths["/api/Order/orders"]["post"];
type GetOrderOperation =
    OrderPaths["/api/Order/orders/{id}"]["get"];

export type ListOrdersQuery = QueryParams<ListOrdersOperation>;
// 200 OK
export type ListOrdersResponse = JsonResponse<ListOrdersOperation>;
export type CreateOrderRequest = JsonRequestBody<CreateOrderOperation>;
// 202 Accepted
export type CreateOrderResponse = JsonResponse<CreateOrderOperation>;
export type GetOrderParams = PathParams<GetOrderOperation>;
// 200 OK
export type OrderResponse = JsonResponse<GetOrderOperation>;

export type AdminCreateOrderRequest = CreateOrderRequest & {
    customerProfileId: number;
};

export type AdminCreateOrderResponse = CreateOrderResponse;
export type ListAdminOrdersQuery = ListOrdersQuery;
export type ListAdminOrdersResponse = ListOrdersResponse;
export type GetAdminOrderByIdResponse = OrderResponse;
