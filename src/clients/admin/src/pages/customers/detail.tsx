import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, UsersIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAccountClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";

import { CustomerStatusBadge } from "./components/CustomerStatusBadge";

function LabeledValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value ?? <span className="italic opacity-40">—</span>}</span>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const navigate = useNavigate();
  const accountClient = useAccountClient();

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ["admin-customer", customerId],
    queryFn: () => accountClient.getAdminProfileById(customerId),
    enabled: !Number.isNaN(customerId),
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
          onClick={() => navigate(ROUTES.customers)}
        >
          <ArrowLeftIcon className="size-4" />
          Customers
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 text-muted-foreground" />
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <h1 className="text-sm font-semibold truncate max-w-[240px]">
              {customer?.displayName || customer?.email || "Customer"}
            </h1>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl p-6 flex flex-col gap-6">
        {isError ? (
          <AdminErrorState
            title="Failed to load customer"
            description="Could not fetch this customer. They may not exist or you may not have access."
          />
        ) : isLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : customer ? (
          <>
            {/* Profile card */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="size-14 shrink-0">
                  <AvatarImage src={customer.avatarUrl || undefined} alt={customer.displayName} />
                  <AvatarFallback className="text-base font-semibold">
                    {customer.displayName?.slice(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold truncate">
                    {customer.displayName || <span className="italic text-muted-foreground font-normal">No display name</span>}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                </div>
                <CustomerStatusBadge status={customer.status as string} />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <LabeledValue label="Phone" value={customer.phoneNumber || null} />
                <LabeledValue label="Type" value={customer.type as string} />
                <LabeledValue
                  label="Identity"
                  value={
                    customer.identityUserId ? (
                      <code className="text-xs break-all">{customer.identityUserId}</code>
                    ) : null
                  }
                />
                <LabeledValue
                  label="Created"
                  value={new Date(customer.created).toLocaleString()}
                />
                <LabeledValue
                  label="Last modified"
                  value={new Date(customer.lastModified).toLocaleString()}
                />
              </div>
            </div>

            {/* Addresses */}
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Addresses
                  {customer.addresses?.length ? (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {customer.addresses.length}
                    </Badge>
                  ) : null}
                </h2>
              </div>
              {!customer.addresses?.length ? (
                <p className="px-6 py-8 text-sm text-center text-muted-foreground">
                  No addresses on file.
                </p>
              ) : (
                <div className="divide-y">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <LabeledValue label="Name" value={address.ownerName} />
                        <LabeledValue label="Type" value={address.type as string} />
                        <LabeledValue label="Phone" value={address.phoneNumber} />
                        <LabeledValue label="Country" value={address.country} />
                        <LabeledValue label="State / City" value={[address.state, address.city].filter(Boolean).join(", ") || null} />
                        <LabeledValue label="Postal code" value={address.postalCode} />
                        <LabeledValue label="Address" value={[address.line1, address.line2].filter(Boolean).join(", ") || null} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
