import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  UsersIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  MoreHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { tanstackQueryClient } from "@/api/api-client";
import { AdminErrorState } from "@/components/admin/admin-page";
import { accountTypes, accountStatuses } from "@shared/api/account-types";
import type { AccountType, AccountStatus, AccountProfileResponse, AdminUpdateAccountProfileRequest } from "@shared/api/account-types";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortField = "displayName" | "email" | "type" | "status" | "created";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function AccountTypeBadge({ type }: { type?: string | null }) {
  if (type === "TenantAdmin") return <Badge className="bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100 text-xs font-normal">Admin</Badge>;
  if (type === "TenantStaff") return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs font-normal">Staff</Badge>;
  return <Badge variant="secondary" className="text-xs font-normal">Customer</Badge>;
}

function AccountStatusBadge({ status }: { status?: string | null }) {
  if (status === "Active") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">Active</Badge>;
  if (status === "Suspended") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs font-normal">Suspended</Badge>;
  if (status === "Archived") return <Badge variant="outline" className="text-xs font-normal text-muted-foreground">Archived</Badge>;
  return <Badge variant="outline" className="text-xs font-normal">{status ?? "—"}</Badge>;
}

function SortHead({
  field,
  label,
  sort,
  onSort,
}: {
  field: SortField;
  label: string;
  sort: { field: SortField; dir: SortDir };
  onSort: (f: SortField) => void;
}) {
  const active = sort.field === field;
  return (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => onSort(field)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sort.dir === "asc" ? <ChevronUpIcon className="size-3 text-foreground" /> : <ChevronDownIcon className="size-3 text-foreground" />
        ) : (
          <ChevronsUpDownIcon className="size-3 text-muted-foreground/50" />
        )}
      </span>
    </TableHead>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

type EditForm = {
  displayName: string;
  email: string;
  phoneNumber: string;
  type: AccountType | "";
  status: AccountStatus | "";
};

function EditAccountDialog({
  account,
  onClose,
}: {
  account: AccountProfileResponse;
  onClose: () => void;
}) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<EditForm>({
    defaultValues: {
      displayName: account.displayName ?? "",
      email: account.email ?? "",
      phoneNumber: account.phoneNumber ?? "",
      type: (account.type as AccountType) ?? "",
      status: (account.status as AccountStatus) ?? "",
    },
  });

  const mutation = tanstackQueryClient.useMutation("put", "/api/Account/admin/profiles/{id}");

  const onSubmit = async (values: EditForm) => {
    const body: AdminUpdateAccountProfileRequest = {
      displayName: values.displayName || null,
      email: values.email || null,
      phoneNumber: values.phoneNumber || null,
      type: (values.type as AccountType) || null,
      status: (values.status as AccountStatus) || null,
    };
    await mutation.mutateAsync({
      params: { path: { id: account.id } },
      body,
    });
    toast.success("Account updated");
    tanstackQueryClient.invalidateQueries({ queryKey: ["get", "/api/Account/admin/profiles"] });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
          <DialogDescription>{account.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Display name</label>
            <Input {...register("displayName")} placeholder="Display name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input {...register("email")} type="email" placeholder="Email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Phone number</label>
            <Input {...register("phoneNumber")} placeholder="Phone number" />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-medium">Type</label>
              <select
                {...register("type")}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— keep —</option>
                {accountTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                {...register("status")}
                className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— keep —</option>
                {accountStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function AccountRow({
  account,
  onEdit,
}: {
  account: AccountProfileResponse;
  onEdit: () => void;
}) {
  const initials = account.displayName
    ? account.displayName.slice(0, 2).toUpperCase()
    : (account.email?.slice(0, 2).toUpperCase() ?? "??");

  const createdDate = account.created
    ? new Date(account.created).toLocaleDateString("vi-VN")
    : "—";

  return (
    <TableRow>
      <TableCell>
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm truncate max-w-48">{account.displayName || <span className="italic text-muted-foreground">—</span>}</span>
          <span className="text-[11px] text-muted-foreground">{account.email}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {account.phoneNumber || <span className="italic opacity-50">—</span>}
      </TableCell>
      <TableCell><AccountTypeBadge type={account.type} /></TableCell>
      <TableCell><AccountStatusBadge status={account.status} /></TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{createdDate}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <PencilIcon className="size-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 20, 50];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: "created", dir: "desc" });
  const [editingAccount, setEditingAccount] = useState<AccountProfileResponse | null>(null);

  function handleSort(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const { data, isLoading, isError } = tanstackQueryClient.useQuery(
    "get",
    "/api/Account/admin/profiles",
    {
      params: {
        query: {
          pageNumber: page,
          pageSize,
          search: search.trim() || null,
          type: typeFilter || null,
          status: statusFilter || null,
          sortBy: sort.field,
          sortDirection: sort.dir,
        },
      },
    }
  );

  const accounts = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = search.trim() || typeFilter || statusFilter;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-2">
        <UsersIcon className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Customers</h1>
        {!isLoading && totalCount > 0 && (
          <Badge variant="secondary">{totalCount}</Badge>
        )}
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <SearchIcon className="size-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search name or email…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as AccountType | ""); setPage(1); }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All types</option>
            {accountTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as AccountStatus | ""); setPage(1); }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All statuses</option>
            {accountStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load accounts"
              description="There was an error fetching accounts. Please try again."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <SortHead field="displayName" label="Name" sort={sort} onSort={handleSort} />
                  <TableHead>Phone</TableHead>
                  <SortHead field="type" label="Type" sort={sort} onSort={handleSort} />
                  <SortHead field="status" label="Status" sort={sort} onSort={handleSort} />
                  <SortHead field="created" label="Joined" sort={sort} onSort={handleSort} />
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="size-7 rounded-full" /></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <UsersIcon className="size-10 text-muted-foreground/40" />
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">
                            {hasFilters ? "No accounts match your filters" : "No accounts yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hasFilters ? "Try adjusting your search or filters." : "Accounts will appear here when customers sign up."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      onEdit={() => setEditingAccount(account)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer */}
        {!isLoading && totalCount > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <span>
              {totalCount} {totalCount === 1 ? "account" : "accounts"}
              {hasFilters && " found"}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span>Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeftIcon className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRightIcon className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
}
