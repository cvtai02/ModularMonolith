import type {
  CreateOrderRequest,
  CreateOrderResponse,
  ListOrdersQuery,
  ListOrdersResponse,
  OrderResponse,
} from "../types/order";

export interface IOrderClient {
  // Request: src/Modules/Order/DTOs/Orders/CreateOrderRequest.cs
  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse>;

  // Response: src/Modules/Order/DTOs/Orders/OrderResponse.cs
  getOrderById(id: number): Promise<OrderResponse>;

  // Query: src/Modules/Order/DTOs/Orders/ListOrdersRequest.cs
  // Item response: src/Modules/Order/DTOs/Orders/OrderSummaryResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/order.ts.
  listOrders(query?: ListOrdersQuery): Promise<ListOrdersResponse>;
}
