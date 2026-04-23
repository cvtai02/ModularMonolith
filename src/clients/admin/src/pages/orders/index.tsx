import { useState } from "react";
import {
  ShoppingCartIcon,
  ChevronRightIcon,
  PackageIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tanstackQueryClient } from "@/api/api-client";
import { AdminErrorState } from "@/components/admin/admin-page";
import type { OrderResponse } from "@shared/api/api-types";
import { cn } from "@/lib/utils";

// ─── Status config ────────────────────────────────────────────────────────────
// OrderStatus enum: 0=Draft, 1=Placed, 2=Paid, 3=Cancelled, 4=Shipped

const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
  0: { label: "Draft",     className: "border-amber-200 bg-amber-100 text-amber-700" },
  1: { label: "Placed",    className: "border-blue-200 bg-blue-100 text-blue-700" },
  2: { label: "Paid",      className: "border-purple-200 bg-purple-100 text-purple-700" },
  3: { label: "Cancelled", className: "border-border bg-muted text-muted-foreground" },
  4: { label: "Shipped",   className: "border-indigo-200 bg-indigo-100 text-indigo-700" },
};

const ALL_STATUSES = [0, 1, 2, 3, 4] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function OrderBadge({ status }: { status?: number }) {
  const cfg = STATUS_CONFIG[status ?? -1];
  if (!cfg) return null;
  return <Badge className={cn("hover:opacity-100", cfg.className)}>{cfg.label}</Badge>;
}

function formatAmount(val?: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(val ?? 0));
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | number;

export default function OrdersPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [detail, setDetail] = useState<OrderResponse | null>(null);

  const { data, isLoading, isError } = tanstackQueryClient.useQuery(
    "get",
    "/api/Order/orders",
    {
      params: {
        query: {
          pageSize: 50,
          status: filter !== "all" ? filter : undefined,
        },
      },
    }
  );

  const orders = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    ...ALL_STATUSES.map((s) => ({ key: s as StatusFilter, label: STATUS_CONFIG[s].label })),
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShoppingCartIcon className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Orders</h1>
        {!isLoading && <Badge variant="secondary">{totalCount}</Badge>}
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Filter tabs */}
        <div className="overflow-x-auto border-b">
          <div className="flex min-w-max">
            {filterTabs.map((tab) => (
              <button
                key={String(tab.key)}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                  filter === tab.key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <div className="p-6">
            <AdminErrorState title="Failed to load orders" description="There was an error fetching orders. Please try again." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                      <PackageIcon className="size-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        No {filter !== "all" ? STATUS_CONFIG[filter as number]?.label.toLowerCase() + " " : ""}orders found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => setDetail(order)}>
                    <TableCell className="font-mono text-sm font-medium">{order.code}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.customerId ?? <span className="italic opacity-50">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {order.lines?.length ?? 0}
                    </TableCell>
                    <TableCell>
                      <OrderBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatAmount(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <ChevronRightIcon className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!isLoading && orders.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? "order" : "orders"}
              {filter !== "all" && ` · ${STATUS_CONFIG[filter as number]?.label}`}
            </div>
          </>
        )}
      </div>

      {/* Order detail Sheet */}
      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="font-mono">{detail?.code}</SheetTitle>
            <p className="text-sm text-muted-foreground">{detail && formatDate(detail.createdAt)}</p>
          </SheetHeader>

          {detail && (
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <OrderBadge status={detail.status} />
              </div>

              <Separator />

              {/* Customer */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</p>
                <p className="text-sm">{detail.customerId ?? <span className="italic text-muted-foreground">Guest</span>}</p>
              </div>

              <Separator />

              {/* Lines */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Items</p>
                {(detail.lines ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No items</p>
                ) : (
                  (detail.lines ?? []).map((line) => (
                    <div key={line.id} className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{line.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.sku && <span className="font-mono">{line.sku} · </span>}
                          {line.quantity} × {formatAmount(line.unitPrice)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums">{formatAmount(line.subtotal)}</p>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-semibold tabular-nums">{formatAmount(detail.totalAmount)}</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
