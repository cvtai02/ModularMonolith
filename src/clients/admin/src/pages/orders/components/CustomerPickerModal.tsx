import { useState } from "react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, UserIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountClient } from "@/components/containers/api-client-provider";
import { cn } from "@/lib/utils";
import type { AccountProfileResponse } from "@shared/api/contracts/account";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (customer: AccountProfileResponse) => void;
}

const PAGE_SIZE = 12;

export function CustomerPickerModal({ open, onOpenChange, onConfirm }: Props) {
  const accountClient = useAccountClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AccountProfileResponse | null>(null);

  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setSearch("");
      setPage(1);
      setSelected(null);
    }
    onOpenChange(newOpen);
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customers-picker", { search, page }],
    queryFn: () =>
      accountClient.listAdminProfiles({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        type: "Customer" as unknown as never,
        sortBy: "displayName",
        sortDirection: "asc",
      }),
    enabled: open,
  });

  const customers = (data?.items ?? []) as AccountProfileResponse[];
  const totalPages = data?.totalPages ?? 1;

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[70vh] w-[560px] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3">
          <DialogTitle>Select customer</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Skeleton className="size-4 shrink-0 rounded" />
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <UserIcon className="size-10 opacity-30" />
              <p className="text-sm">
                {search ? "No customers match your search." : "No customers found."}
              </p>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-0.5", isFetching && "opacity-60")}>
              {customers.map((customer) => {
                const isSelected = selected?.id === customer.id;
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => setSelected(customer)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/50"
                      )}
                    >
                      {isSelected && <CheckIcon className="size-3" />}
                    </div>

                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="text-xs font-medium">
                        {customer.displayName?.slice(0, 2).toUpperCase() ?? "??"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{customer.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-center gap-2 border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}

        <DialogFooter showCloseButton className="shrink-0 border-t px-4 py-3">
          {selected && (
            <span className="mr-auto text-sm text-muted-foreground truncate max-w-[200px]">
              {selected.displayName}
            </span>
          )}
          <Button disabled={!selected} onClick={handleConfirm}>
            Select customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
