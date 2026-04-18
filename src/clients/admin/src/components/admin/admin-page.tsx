import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

type ContractField = {
  name: string;
  type: string;
  required?: boolean;
};

type EndpointSummary = {
  method: string;
  path: string;
  note: string;
};

export function AdminSectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-balance">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </section>
  );
}

export function AdminStatsGrid({ items }: { items: StatCardProps[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="gap-1">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">{item.value}</CardTitle>
          </CardHeader>
          {item.hint ? (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{item.hint}</p>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </section>
  );
}

export function AdminLoadingGrid() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export function AdminErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function ContractCard({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields: ContractField[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field) => (
          <div
            key={`${title}-${field.name}`}
            className="flex flex-col gap-1 rounded-lg border border-dashed p-3 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium">{field.name}</p>
              <p className="text-xs text-muted-foreground">{field.required ? "Required" : "Optional"}</p>
            </div>
            <code className="text-xs text-muted-foreground">{field.type}</code>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EndpointList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: EndpointSummary[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={`${item.method}-${item.path}`} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", methodColor(item.method))}>
                {item.method}
              </span>
              <code className="text-sm">{item.path}</code>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BackendGapNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Alert>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

function methodColor(method: string) {
  switch (method) {
    case "GET":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "POST":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "PUT":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "DELETE":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
