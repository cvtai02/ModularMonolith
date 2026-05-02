import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, PackageIcon, PlusIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { applyValidationErrors } from "@/lib/form-error";
import type { ProductResponse } from "@shared/api/contracts/productcatalog";

import { ProductPickerModal } from "./ProductPickerModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CollectionFormValues = {
  title: string;
  slug: string;
  description: string;
};

/** Minimal product shape used for the picked products list. */
export type PickedItem = {
  id: number;
  name?: string | null;
  imageUrl?: string | null;
  categoryName?: string | null;
  status?: string | null;
};

interface Props {
  pageTitle: string;
  backLabel?: string;
  defaultValues?: Partial<CollectionFormValues>;
  /** Pre-populate from the collection's currently assigned products. */
  initialProducts?: PickedItem[];
  isPending: boolean;
  isEdit?: boolean;
  isAdding?: boolean;
  onDiscard: () => void;
  /**
   * null = products were not modified; preserve existing assignments.
   * number[] = explicit list to set (send as-is, even if empty).
   */
  onSubmit: (values: CollectionFormValues, productIds: number[] | null) => Promise<void>;
  onAddProducts?: (products: ProductResponse[]) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "Active")
    return (
      <Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Active
      </Badge>
    );
  if (status === "Draft")
    return <Badge variant="secondary" className="shrink-0 text-xs font-normal">Draft</Badge>;
  if (status === "Unlisted")
    return <Badge variant="outline" className="shrink-0 text-xs font-normal">Unlisted</Badge>;
  return null;
}

// ─── Product row ──────────────────────────────────────────────────────────────

function PickedProductRow({
  product,
  onRemove,
}: {
  product: PickedItem;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors">
      <Avatar className="size-8 shrink-0 rounded-md">
        <AvatarImage src={product.imageUrl ?? undefined} alt={product.name ?? ""} />
        <AvatarFallback className="rounded-md text-[10px] font-medium">
          {product.name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        {product.categoryName && (
          <p className="truncate text-xs text-muted-foreground">{product.categoryName}</p>
        )}
      </div>
      <StatusBadge status={product.status} />
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${product.name}`}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function CollectionFormLayout({
  pageTitle,
  backLabel = "Collections",
  defaultValues,
  initialProducts,
  isPending,
  isEdit = false,
  isAdding = false,
  onDiscard,
  onSubmit,
  onAddProducts,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      ...defaultValues,
    },
  });

  const [pickedProducts, setPickedProducts] = useState<PickedItem[]>(initialProducts ?? []);
  const [productsModified, setProductsModified] = useState(false);
  const productsModifiedRef = useRef(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  // Sync from API when initialProducts changes (e.g. after quick-add refetch),
  // but only while the user hasn't locally edited the replace list.
  useEffect(() => {
    if (!productsModifiedRef.current) {
      setPickedProducts(initialProducts ?? []);
    }
    // productsModifiedRef is a ref — intentionally not in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts]);

  function markModified() {
    productsModifiedRef.current = true;
    setProductsModified(true);
  }

  function removeProduct(id: number) {
    setPickedProducts((prev) => prev.filter((p) => p.id !== id));
    markModified();
  }

  function addFromPicker(newProducts: ProductResponse[]) {
    setPickedProducts((prev) => [
      ...prev,
      ...newProducts.map((p) => ({
        id: p.id!,
        name: p.name,
        imageUrl: p.imageUrl,
        categoryName: p.categoryName,
        status: p.status,
      })),
    ]);
    markModified();
  }

  const pickedIds = new Set(pickedProducts.map((p) => p.id));

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit) setValue("slug", slugify(e.target.value));
  }

  const doSubmit = handleSubmit(async (values) => {
    try {
      const productIds = productsModified ? pickedProducts.map((p) => p.id) : null;
      await onSubmit(values, productIds);
    } catch (err) {
      if (!applyValidationErrors(err, setError)) throw err;
    }
  });

  async function handleAddProducts(products: ProductResponse[]) {
    if (!onAddProducts) return;
    try {
      await onAddProducts(products);
    } catch {
      // error toasts handled by caller
    }
  }

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" type="button" className="-ml-2 gap-1.5" onClick={onDiscard}>
          <ArrowLeftIcon className="size-4" />
          {backLabel}
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" type="button" disabled={isPending} onClick={doSubmit}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl p-6 flex flex-col gap-6">
        {/* Details card */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Details</h2>
          <FieldGroup>
            <Field>
              <FieldLabel>Title *</FieldLabel>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="e.g. Summer Sale"
                onChange={(e) => {
                  register("title").onChange(e);
                  onTitleChange(e);
                }}
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Slug</FieldLabel>
              <Input
                {...register("slug")}
                placeholder="summer-sale"
                className="font-mono text-sm"
              />
              {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                {...register("description")}
                placeholder="Briefly describe this collection…"
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* Products card */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b">
            <div>
              <h2 className="text-sm font-semibold">Products</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isEdit
                  ? 'Use "Add products" to append, or remove/add below to replace assignments on save.'
                  : "Optionally add products to this collection."}
              </p>
            </div>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAdding}
                onClick={() => setAddPickerOpen(true)}
              >
                <PackageIcon className="size-3.5" />
                Add products
              </Button>
            )}
          </div>

          {pickedProducts.length > 0 ? (
            <div>
              <div className="divide-y">
                {pickedProducts.map((p) => (
                  <div key={p.id} className="px-4">
                    <PickedProductRow product={p} onRemove={() => removeProduct(p.id)} />
                  </div>
                ))}
              </div>
              <div className="border-t px-4 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setPickerOpen(true)}
                >
                  <PlusIcon className="size-3.5" />
                  Add more
                </Button>
              </div>
              {isEdit && productsModified && (
                <p className="border-t px-4 py-2 text-[11px] text-amber-600 dark:text-amber-400">
                  Saving will replace all current assignments with this list.
                </p>
              )}
            </div>
          ) : (
            <div className="px-6 py-6">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
              >
                <PackageIcon className="size-4" />
                Browse products…
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replace / add picker */}
      <ProductPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        alreadyPickedIds={pickedIds}
        onConfirm={addFromPicker}
      />

      {/* Quick "Add products" picker — edit only */}
      {isEdit && (
        <ProductPickerModal
          open={addPickerOpen}
          onOpenChange={setAddPickerOpen}
          alreadyPickedIds={pickedIds}
          onConfirm={handleAddProducts}
        />
      )}
    </div>
  );
}
