import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "Draft"
  | "PendingInventory"
  | "Placed"
  | "Paid"
  | "Rejected"
  | "Cancelled"
  | "Shipped";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  Draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
  PendingInventory: {
    label: "Pending Inventory",
    className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  Placed: {
    label: "Placed",
    className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  Paid: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-100",
  },
  Shipped: {
    label: "Shipped",
    className: "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100",
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as OrderStatus];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  return (
    <Badge className={cn("text-xs font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}
