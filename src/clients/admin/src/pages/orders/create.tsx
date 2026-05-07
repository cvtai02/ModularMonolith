import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ClipboardListIcon,
  CreditCardIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOrderClient,
  usePaymentClient,
} from "@/components/containers/api-client-provider";
import { applyValidationErrors } from "@/lib/form-error";
import { ROUTES } from "@/configs/routes";
import { ApiError } from "@shared/api/contracts/common-types";
import type { AccountProfileResponse } from "@shared/api/contracts/account";

import { CustomerPickerModal } from "./components/CustomerPickerModal";
import { VariantPickerModal, type SelectedVariantItem } from "./components/VariantPickerModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type ShippingAddressValues = {
  ownerName: string;
  type: string;
  phoneNumber: string;
  email: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  line1: string;
  line2: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminCreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const orderClient = useOrderClient();
  const paymentClient = usePaymentClient();

  const [customer, setCustomer] = useState<AccountProfileResponse | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);

  const [orderItems, setOrderItems] = useState<SelectedVariantItem[]>([]);
  const [variantPickerOpen, setVariantPickerOpen] = useState(false);

  const [paymentProvider, setPaymentProvider] = useState<string>("CashOnDelivery");

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => paymentClient.listPaymentMethods(),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ShippingAddressValues>({
    defaultValues: {
      ownerName: "",
      type: "Home",
      phoneNumber: "",
      email: "",
      country: "VN",
      state: "",
      city: "",
      postalCode: "",
      line1: "",
      line2: "",
    },
  });

  const { mutateAsync: createOrder, isPending } = useMutation({
    mutationFn: orderClient.adminCreateOrder.bind(orderClient),
  });

  function addVariants(items: SelectedVariantItem[]) {
    setOrderItems((prev) => {
      const map = new Map(prev.map((i) => [i.variantId, i]));
      for (const item of items) {
        const existing = map.get(item.variantId);
        if (existing) {
          map.set(item.variantId, {
            ...existing,
            quantity: existing.quantity + item.quantity,
          });
        } else {
          map.set(item.variantId, item);
        }
      }
      return Array.from(map.values());
    });
  }

  function adjustItemQty(variantId: number, delta: number) {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(variantId: number) {
    setOrderItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  const alreadyAddedVariantIds = new Set(orderItems.map((i) => i.variantId));
  const estimatedTotal = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const doSubmit = handleSubmit(async (addressValues) => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }
    if (!paymentProvider) {
      toast.error("Please choose a payment method.");
      return;
    }

    let orderCode: string;
    try {
      const result = await createOrder({
        customerProfileId: customer?.id ?? null,
        paymentProvider,
        shippingAddress: {
          ownerName: addressValues.ownerName,
          type: addressValues.type,
          phoneNumber: addressValues.phoneNumber,
          email: addressValues.email,
          country: addressValues.country,
          state: addressValues.state || null,
          city: addressValues.city || null,
          postalCode: addressValues.postalCode || null,
          line1: addressValues.line1,
          line2: addressValues.line2 || null,
        },
        items: orderItems.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });
      orderCode = result.code;
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        toast.error("Out of stock. Adjust quantities and try again.");
        return;
      }
      if (!applyValidationErrors(err, setError)) {
        toast.error("Failed to place order. Please check the form and try again.");
      }
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

    // Kick off checkout for the chosen provider. Outcomes:
    //   - CashOnDelivery: backend marks the transaction Succeeded and the order Placed.
    //   - Provider returning a `checkoutUrl`: surface the link so admin can share with the customer.
    //   - Sepay (NotImplementedException): warn admin; the order itself is still created.
    try {
      const checkout = await paymentClient.createCheckout(orderCode, {
        provider: paymentProvider,
        returnUrl: null,
        cancelUrl: null,
      });

      if (checkout.checkoutUrl) {
        toast.success(`Order ${orderCode} placed. Share the payment link with the customer.`, {
          description: checkout.checkoutUrl,
        });
      } else if (
        (checkout.provider ?? "").toLowerCase() === "cashondelivery" &&
        String(checkout.status) === "Succeeded"
      ) {
        toast.success(`Order ${orderCode} placed (Cash on Delivery).`);
      } else {
        toast.success(`Order ${orderCode} placed.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (/not\s*implement/i.test(message)) {
        toast.warning(
          `Order ${orderCode} placed, but ${paymentProvider} checkout is not available yet.`,
        );
      } else {
        toast.warning(
          `Order ${orderCode} placed, but checkout could not be started: ${message || "unknown error"}.`,
        );
      }
    } finally {
      navigate(ROUTES.orderDetail(orderCode));
    }
  });

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="-ml-2 gap-1.5"
          onClick={() => navigate(ROUTES.orders)}
        >
          <ArrowLeftIcon className="size-4" />
          Orders
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="size-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">Place Order</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={() => navigate(ROUTES.orders)}>
            Discard
          </Button>
          <Button size="sm" type="button" disabled={isPending} onClick={doSubmit}>
            {isPending ? "Placing…" : "Place order"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl p-6 flex flex-col gap-6">

        {/* Customer section */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Customer</h2>
            <div className="flex items-center gap-2">
              {customer && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomer(null)}
                >
                  Remove
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCustomerPickerOpen(true)}
              >
                <UserIcon className="size-3.5" />
                {customer ? "Change" : "Select customer"}
              </Button>
            </div>
          </div>
          {customer ? (
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="text-xs font-medium">
                  {customer.displayName?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{customer.displayName}</p>
                <p className="text-xs text-muted-foreground">{customer.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-muted-foreground">
              <UserIcon className="size-4 shrink-0 opacity-40" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">Guest order</p>
                <p className="text-xs opacity-60">No customer — order will be unassigned</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomerPickerOpen(true)}
                className="shrink-0 text-xs underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Select customer
              </button>
            </div>
          )}
        </div>

        {/* Order items */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-sm font-semibold">Products *</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVariantPickerOpen(true)}
            >
              <PlusIcon className="size-3.5" />
              Add products
            </Button>
          </div>

          {orderItems.length === 0 ? (
            <div className="px-6 py-6">
              <button
                type="button"
                onClick={() => setVariantPickerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
              >
                <PackageIcon className="size-4" />
                Browse products and variants…
              </button>
            </div>
          ) : (
            <div>
              <div className="divide-y">
                {orderItems.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-4 px-6 py-3">
                    <Avatar className="size-9 shrink-0 rounded-md">
                      <AvatarImage src={item.imageUrl || undefined} alt={item.productName} />
                      <AvatarFallback className="rounded-md text-xs">
                        {item.productName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustItemQty(item.variantId, -1)}
                        className="flex size-6 items-center justify-center rounded border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <MinusIcon className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => adjustItemQty(item.variantId, 1)}
                        className="flex size-6 items-center justify-center rounded border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <PlusIcon className="size-3" />
                      </button>
                    </div>
                    <div className="w-24 text-right shrink-0">
                      <p className="text-sm tabular-nums">
                        {new Intl.NumberFormat().format(item.unitPrice * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat().format(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t px-6 py-3 flex justify-end">
                <p className="text-sm font-semibold">
                  Estimated total:{" "}
                  <span className="tabular-nums">
                    {new Intl.NumberFormat().format(estimatedTotal)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <CreditCardIcon className="size-4 text-muted-foreground" />
            Payment Method *
          </h2>
          {paymentMethodsLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment methods available.</p>
          ) : (
            <RadioGroup
              value={paymentProvider}
              onValueChange={setPaymentProvider}
              className="flex flex-col gap-2"
            >
              {paymentMethods.map((method) => (
                <label
                  key={method.code}
                  htmlFor={`payment-${method.code}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                >
                  <RadioGroupItem value={method.code} id={`payment-${method.code}`} />
                  <span className="flex-1">{method.displayName}</span>
                  {method.requiresRedirect && (
                    <span className="text-xs text-muted-foreground">redirect</span>
                  )}
                </label>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* Shipping address */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Shipping Address *</h2>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Name *</FieldLabel>
                <Input
                  {...register("ownerName", { required: "Name is required" })}
                  placeholder="Recipient name"
                />
                {errors.ownerName && <FieldError>{errors.ownerName.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Input
                  {...register("type")}
                  placeholder="Home, Office…"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Phone *</FieldLabel>
                <Input
                  {...register("phoneNumber", { required: "Phone is required" })}
                  placeholder="+84 …"
                />
                {errors.phoneNumber && <FieldError>{errors.phoneNumber.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...register("email")}
                  placeholder="recipient@example.com"
                  type="email"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Address line 1 *</FieldLabel>
              <Input
                {...register("line1", { required: "Address line 1 is required" })}
                placeholder="Street address"
              />
              {errors.line1 && <FieldError>{errors.line1.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Address line 2</FieldLabel>
              <Input
                {...register("line2")}
                placeholder="Apartment, suite, unit…"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>City</FieldLabel>
                <Input {...register("city")} placeholder="City" />
              </Field>
              <Field>
                <FieldLabel>State / Province</FieldLabel>
                <Input {...register("state")} placeholder="State" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Postal code</FieldLabel>
                <Input {...register("postalCode")} placeholder="Postal code" />
              </Field>
              <Field>
                <FieldLabel>Country *</FieldLabel>
                <Input
                  {...register("country", { required: "Country is required" })}
                  placeholder="Country"
                />
                {errors.country && <FieldError>{errors.country.message}</FieldError>}
              </Field>
            </div>
          </FieldGroup>
        </div>
      </div>

      <CustomerPickerModal
        open={customerPickerOpen}
        onOpenChange={setCustomerPickerOpen}
        onConfirm={setCustomer}
      />

      <VariantPickerModal
        open={variantPickerOpen}
        onOpenChange={setVariantPickerOpen}
        alreadyAddedVariantIds={alreadyAddedVariantIds}
        onConfirm={addVariants}
      />
    </div>
  );
}
