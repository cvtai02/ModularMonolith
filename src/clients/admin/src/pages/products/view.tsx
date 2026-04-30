import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tanstackQueryClient } from "@/api/api-client";
import { ROUTES } from "@/configs/routes";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ProductDetailHeader } from "./view/ProductDetailHeader";
import { OverviewTab } from "./view/OverviewTab";
import { VariantsTab } from "./view/VariantsTab";
import { MediaTab } from "./view/MediaTab";
import { InventoryTab } from "./view/InventoryTab";
import { ShippingTab } from "./view/ShippingTab";

type Tab = "overview" | "variants" | "media" | "inventory" | "shipping";

export default function ProductViewPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: product, isLoading, isError } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/products/{id}",
    { params: { path: { id: productId } } }
  );

  if (isError) {
    return (
      <div className="p-6">
        <AdminErrorState
          title="Failed to load product"
          description="Could not fetch product details. Please try again."
        />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "variants", label: "Variants", count: product?.variants?.length },
    { id: "media", label: "Media", count: product?.medias?.length },
    { id: "inventory", label: "Inventory" },
    { id: "shipping", label: "Shipping" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.products)}>
          <ArrowLeftIcon data-icon="inline-start" />
          Products
        </Button>
        {product && (
          <Button size="sm" onClick={() => navigate(ROUTES.productEdit(productId))}>
            <PencilIcon data-icon="inline-start" />
            Edit
          </Button>
        )}
      </div>

      {/* Header */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : product ? (
        <ProductDetailHeader product={product} />
      ) : null}

      {/* Tab nav */}
      <div className="border-b">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-normal tabular-nums">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {isLoading ? (
        <ContentSkeleton />
      ) : product ? (
        <>
          {activeTab === "overview" && <OverviewTab product={product} />}
          {activeTab === "variants" && <VariantsTab product={product} />}
          {activeTab === "media" && <MediaTab product={product} />}
          {activeTab === "inventory" && <InventoryTab product={product} />}
          {activeTab === "shipping" && <ShippingTab product={product} />}
        </>
      ) : null}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex gap-4 items-start rounded-xl border bg-card p-5">
      <Skeleton className="size-20 rounded-lg shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-32 rounded-xl lg:col-span-2" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
