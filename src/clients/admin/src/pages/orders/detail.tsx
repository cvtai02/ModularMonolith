import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, ClipboardListIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOrderClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";

import { OrderStatusBadge } from "./components/OrderStatusBadge";

function LabeledValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value ?? <span className="italic opacity-40">—</span>}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();
  const orderClient = useOrderClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => orderClient.getAdminOrderById(orderId),
    enabled: !Number.isNaN(orderId),
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
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <h1 className="text-sm font-semibold font-mono">{order?.code}</h1>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-3xl p-6 flex flex-col gap-6">
        {isError ? (
          <AdminErrorState
            title="Failed to load order"
            description="Could not fetch this order. It may not exist or you may not have access."
          />
        ) : isLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </>
        ) : order ? (
          <>
            {/* Rejection reason banner */}
            {order.status === "Rejected" && order.rejectionReason && (
              <Alert variant="destructive">
                <AlertTitle>Order Rejected</AlertTitle>
                <AlertDescription>{order.rejectionReason}</AlertDescription>
              </Alert>
            )}

            {/* Summary card */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Order Summary</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <LabeledValue label="Order code" value={<code className="font-mono">{order.code}</code>} />
                <LabeledValue label="Customer ID" value={order.customerId} />
                <LabeledValue
                  label="Total"
                  value={
                    <span className="font-medium tabular-nums">
                      {new Intl.NumberFormat().format(Number(order.totalAmount))}{" "}
                      {order.currencyCode}
                    </span>
                  }
                />
                <LabeledValue
                  label="Inventory reservation"
                  value={
                    order.inventoryReservationId != null
                      ? String(order.inventoryReservationId)
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-sm font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <LabeledValue label="Name" value={order.shippingAddress.ownerName} />
                  <LabeledValue label="Type" value={order.shippingAddress.type} />
                  <LabeledValue label="Phone" value={order.shippingAddress.phoneNumber} />
                  <LabeledValue label="Email" value={order.shippingAddress.email} />
                  <LabeledValue label="Country" value={order.shippingAddress.country} />
                  <LabeledValue label="State" value={order.shippingAddress.state} />
                  <LabeledValue label="City" value={order.shippingAddress.city} />
                  <LabeledValue label="Postal code" value={order.shippingAddress.postalCode} />
                  <LabeledValue label="Address line 1" value={order.shippingAddress.line1} />
                  <LabeledValue label="Address line 2" value={order.shippingAddress.line2} />
                </div>
              </div>
            )}

            {/* Line items */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-sm font-semibold">
                  Line Items
                  {order.lines?.length ? (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {order.lines.length}
                    </Badge>
                  ) : null}
                </h2>
              </div>
              {!order.lines?.length ? (
                <p className="px-6 py-8 text-sm text-center text-muted-foreground">
                  No line items.
                </p>
              ) : (
                <div className="divide-y">
                  {order.lines.map((line) => (
                    <div key={line.id} className="flex items-center gap-4 px-6 py-3">
                      <Avatar className="size-10 shrink-0 rounded-md">
                        <AvatarImage src={line.imageUrl ?? undefined} alt={line.productName} />
                        <AvatarFallback className="rounded-md text-xs">
                          {line.productName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{line.productName}</p>
                        <p className="text-xs text-muted-foreground truncate">{line.variantName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm tabular-nums">
                          {new Intl.NumberFormat().format(Number(line.unitPrice))} × {line.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          = {new Intl.NumberFormat().format(Number(line.subtotal))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t px-6 py-3 flex justify-end">
                <p className="text-sm font-semibold">
                  Total:{" "}
                  <span className="tabular-nums">
                    {new Intl.NumberFormat().format(Number(order.totalAmount))}{" "}
                    {order.currencyCode}
                  </span>
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
