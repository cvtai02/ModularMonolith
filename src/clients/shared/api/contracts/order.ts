import type {
  CreateOrderRequest,
  CreateOrderResponse,
  ListOrdersQuery,
  ListOrdersResponse,
  OrderResponse,
} from "../types/order";

export interface IOrderClient {
  createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse>;
  getOrderById(id: number): Promise<OrderResponse>;
  listOrders(query?: ListOrdersQuery): Promise<ListOrdersResponse>;
}
