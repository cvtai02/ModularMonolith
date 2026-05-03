import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardListIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button as PaginationButton } from "@/components/ui/button";
import { useOrderClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";

import { OrderStatusBadge } from "./components/OrderStatusBadge";

type StatusFilter =
  | "all"
  | "Draft"
  | "PendingInventory"
  | "Placed"
  | "Paid"
  | "Rejected"
  | "Cancelled"
  | "Shipped";

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const navigate = useNavigate();
  const orderClient = useOrderClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-orders", { search, status: statusFilter, page }],
    queryFn: () =>
      orderClient.listAdminOrders({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const orders = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Orders</h1>
          {!isLoading && totalCount > 0 && (
            <Badge variant="secondary">{totalCount}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.orderCreate)}>
          <PlusIcon data-icon="inline-start" />
          Place order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search order code or customer…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="PendingInventory">Pending Inventory</SelectItem>
            <SelectItem value="Placed">Placed</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load orders"
              description="There was an error fetching orders. Please try again."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Total</TableHead>
                <TableHead className="w-16 text-right">Lines</TableHead>
                <TableHead className="w-36">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <ClipboardListIcon className="size-10 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs text-muted-foreground">
                          {search || statusFilter !== "all"
                            ? "Try adjusting your search or filter."
                            : "No orders have been placed yet."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => navigate(ROUTES.orderDetail(order.id))}
                  >
                    <TableCell>
                      <code className="font-mono text-sm font-medium">{order.code}</code>
                      {order.rejectionReason && (
                        <p className="mt-0.5 text-xs text-red-600 dark:text-red-400 truncate max-w-[180px]">
                          {order.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.customerId ?? <span className="italic opacity-40">—</span>}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {new Intl.NumberFormat().format(Number(order.totalAmount))}{" "}
                      <span className="text-muted-foreground text-xs">{order.currencyCode}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {order.lineCount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : <span className="italic opacity-40">—</span>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!isLoading && totalCount > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">
                {totalCount} order{totalCount !== 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <PaginationButton
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </PaginationButton>
                  <span className="text-xs text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <PaginationButton
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </PaginationButton>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
