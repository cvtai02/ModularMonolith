import type {
  AdminCreateOrderRequest,
  AdminCreateOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetAdminOrderByCodeResponse,
  ListAdminOrdersQuery,
  ListAdminOrdersResponse,
  ListOrdersQuery,
  ListOrdersResponse,
  OrderResponse,
} from "../types/order";

export * from "../types/order"

export interface IOrderClient {
  // Request: src/Modules/Order/DTOs/Orders/CreateOrderRequest.cs
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse>;

  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  getOrderByCode(code: string): Promise<OrderResponse>;

  // Query: src/Modules/Order/DTOs/Orders/ListOrdersRequest.cs
  // Item response: src/Modules/Order/DTOs/Orders/OrderSummaryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/order.ts.
  listOrders(query?: ListOrdersQuery): Promise<ListOrdersResponse>;

  // Contract method: adminCreateOrder. Tenant admin places an order for a selected customer profile.
  // Request: src/Modules/Order/DTOs/Orders/AdminCreateOrderRequest.cs
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  adminCreateOrder(input: AdminCreateOrderRequest): Promise<AdminCreateOrderResponse>;

  // Contract method: listAdminOrders. Tenant admin order listing.
  // Query: src/Modules/Order/DTOs/Orders/ListOrdersRequest.cs
  // Item response: src/Modules/Order/DTOs/Orders/OrderSummaryResponse.cs
  listAdminOrders(query?: ListAdminOrdersQuery): Promise<ListAdminOrdersResponse>;

  // Contract method: getAdminOrderByCode. Tenant admin order detail.
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  getAdminOrderByCode(code: string): Promise<GetAdminOrderByCodeResponse>;
}
