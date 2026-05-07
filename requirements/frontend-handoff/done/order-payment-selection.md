# Claude Frontend Handoff: Order Payment Selection

## Completed

- `app/components/api-client-provider.tsx` — registered `PaymentClient` and added `usePaymentClient()` hook.
- `app/layout.tsx` — wrapped `<body>` children in `<ApiClientProvider>` so checkout (and future shop pages) can consume the clients.
- `app/hooks/use-payment-methods.ts` — fetches `paymentClient.listPaymentMethods()` once on mount; exposes `{ methods, loading, error }`. Type derived via `Awaited<ReturnType<…>>` so we don't depend on a renamed export.
- `app/checkout/page.tsx` — full client-side checkout flow:
  1. Reads cart items from URL search params (`?variantId=…&quantity=…` repeated). No cart state is built yet — the search-param hook is the seam for future cart integration.
  2. Renders shipping-address form (Vietnam-default country) and a radio list of payment methods returned from the server (no enum hardcoding — uses server-returned `code`).
  3. On submit: `orderClient.createOrder({ paymentProvider, shippingAddress, items })` → `paymentClient.createCheckout(order.code, { provider: order.paymentProvider, returnUrl: null, cancelUrl: null })`.
  4. Branches on the checkout response:
     - `checkoutUrl` present → `window.location.href` redirect.
     - `provider === "CashOnDelivery"` and `status === "Succeeded"` → render order-placed confirmation with the returned `order.code`.
     - `NotImplementedException` from `Sepay` → friendly "not available yet" message; keeps the form usable so the user can pick another method.
     - Anything else → surface the backend message inline.

## Notes

- Auth still flows through `appFetch` reading the `access_token` cookie. No auth UI was added in this handoff — the checkout assumes the user is already authenticated and the cookie is present.
- TanStack Query is not part of the nekomin stack yet, so the hook uses plain `useEffect` + state. Easy to swap for `useQuery` later without changing the page contract.

## Summary

Order creation now includes payment method selection. The checkout UI must send the selected provider with the order and then create checkout for the returned order code.

After implementing, move this file to `requirements/frontend-handoff/done/`.

## Shared Contracts

Use:

- `src/clients/shared/api/contracts/order.ts`
- `src/clients/shared/api/types/order.ts`
- `src/clients/shared/api/contracts/payment.ts`
- `src/clients/shared/api/types/payment.ts`

Relevant methods:

```ts
orderClient.createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse>
paymentClient.listPaymentMethods(): Promise<ListPaymentMethodsResponse>
paymentClient.createCheckout(orderCode: string, input: CreatePaymentCheckoutRequest): Promise<CreatePaymentCheckoutResponse>
```

## Create Order Request

`CreateOrderRequest` includes:

```ts
type CreateOrderRequest = {
  currencyCode?: string | null;
  paymentProvider?: string | null;
  shippingAddress: Address;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
};
```

Use `paymentProvider` values returned by `listPaymentMethods`.

Current providers:

- `CashOnDelivery`: no redirect. Backend creates a succeeded COD transaction, publishes `PaymentSucceeded`, marks order `Placed`, publishes `OrderPlaced`, and Inventory commits the reservation.
- `Sepay`: listed as a redirect method, but backend throws `NotImplementedException` if checkout is attempted.

## Frontend Flow

1. User selects payment method before placing order.
2. Submit `createOrder` with `paymentProvider`.
3. Use returned `order.code`.
4. Call `createCheckout(order.code, { provider: order.paymentProvider })`.
5. If response provider is `CashOnDelivery` and status is `Succeeded`, show order placed confirmation.
6. If response has `checkoutUrl`, redirect user.
7. If provider is `Sepay`, show a temporary "not available yet" message if backend returns not implemented.

## Response Notes

`OrderResponse` and `OrderSummaryResponse` now include:

```ts
paymentProvider: string;
```

Do not parse provider strings as enums in the UI; use server-returned method codes.
