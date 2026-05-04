import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAccountClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";

import { CustomerStatusBadge } from "./components/CustomerStatusBadge";

type StatusFilter = "all" | "Active" | "Suspended" | "Archived";

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const navigate = useNavigate();
  const accountClient = useAccountClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-customers", { search, status: statusFilter, page }],
    queryFn: () =>
      accountClient.listAdminProfiles({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        type: "Customer" as never,
        status: statusFilter === "all" ? undefined : (statusFilter as never),
        sortBy: "created",
        sortDirection: "desc",
      }),
  });

  const customers = (data?.items ?? []);
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
          <UsersIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Customers</h1>
          {!isLoading && totalCount > 0 && (
            <Badge variant="secondary">{totalCount}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.customerNew)}>
          <PlusIcon data-icon="inline-start" />
          Add customer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load customers"
              description="There was an error fetching customers. Please try again."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-36">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-9 shrink-0 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <UsersIcon className="size-10 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium">No customers found</p>
                        <p className="text-xs text-muted-foreground">
                          {search || statusFilter !== "all"
                            ? "Try adjusting your search or filter."
                            : "No customers have been added yet."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => navigate(ROUTES.customerDetail(customer.id))}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarImage src={customer.avatarUrl || undefined} alt={customer.displayName} />
                          <AvatarFallback className="text-xs font-medium">
                            {customer.displayName?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {customer.displayName || <span className="italic text-muted-foreground">No name</span>}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CustomerStatusBadge status={customer.status as string} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.phoneNumber || <span className="italic opacity-40">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(customer.created).toLocaleDateString()}
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
                {totalCount} customer{totalCount !== 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
