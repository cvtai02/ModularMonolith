import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon, MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/file-uploader";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { tanstackQueryClient } from "@/api/api-client";
import { ROUTES } from "@/configs/routes";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type OptionEntry = {
  localId: string;
  name: string;
  inputValues: string[];
};

type VariantOverride = {
  useProductPrice: boolean;
  price: string;
  useProductShipping: boolean;
};

type Variant = VariantOverride & {
  localId: string;
  label: string;
  optionValues: { optionName: string; value: string }[];
};

type FormValues = {
  name: string;
  categoryName: string;
  description: string;
  status: string;
  imageUrl: string;
  trackInventory: boolean;
  stock: string;
  sku: string;
  barcode: string;
  allowBackorder: boolean;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  chargeTax: boolean;
  isPhysical: boolean;
  weight: string;
  width: string;
  height: string;
  length: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(t: string) {
  return t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 100);
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function getFilledValues(inputs: string[]) {
  return inputs.filter((v) => v.trim());
}

function deriveVariants(
  options: OptionEntry[],
  overrides: Record<string, VariantOverride>
): Variant[] {
  const active = options.filter(
    (o) => o.name.trim() && getFilledValues(o.inputValues).length > 0
  );
  if (!active.length) return [];

  let combos: Array<Array<{ optionName: string; value: string }>> = [[]];
  for (const opt of active) {
    const vals = getFilledValues(opt.inputValues);
    combos = combos.flatMap((c) => vals.map((v) => [...c, { optionName: opt.name, value: v }]));
  }

  return combos.map((combo) => {
    const localId = combo.map((c) => `${c.optionName}:${c.value}`).join("|");
    const ov = overrides[localId];
    return {
      localId,
      label: combo.map((c) => c.value).join(" / "),
      optionValues: combo,
      useProductPrice: ov?.useProductPrice ?? true,
      price: ov?.price ?? "",
      useProductShipping: ov?.useProductShipping ?? true,
    };
  });
}

// ─── VariantRow ───────────────────────────────────────────────────────────────

function VariantRow({
  variant,
  isSelected,
  onSelect,
  productPrice,
  indent,
}: {
  variant: Variant;
  isSelected: boolean;
  onSelect: (ctrl: boolean) => void;
  productPrice: string;
  indent?: boolean;
}) {
  const displayPrice = variant.useProductPrice
    ? productPrice
      ? `${Number(productPrice).toLocaleString("vi-VN")} ₫`
      : "—"
    : variant.price
    ? `${Number(variant.price).toLocaleString("vi-VN")} ₫`
    : "—";

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors",
        indent && "ml-6",
        isSelected ? "bg-accent" : "hover:bg-muted/50"
      )}
      onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
    >
      <span className="flex-1 text-sm">{variant.label}</span>
      <span className="font-mono text-xs text-muted-foreground">{displayPrice}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddProductPage() {
  const navigate = useNavigate();
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      categoryName: "",
      description: "",
      status: "1",
      imageUrl: "",
      trackInventory: true,
      stock: "",
      sku: "",
      barcode: "",
      allowBackorder: false,
      price: "",
      compareAtPrice: "",
      costPrice: "",
      chargeTax: false,
      isPhysical: true,
      weight: "",
      width: "",
      height: "",
      length: "",
    },
  });

  const watchPrice = watch("price");
  const watchCostPrice = watch("costPrice");
  const watchTrackInventory = watch("trackInventory");

  const [options, setOptions] = useState<OptionEntry[]>([]);
  const [variantOverrides, setVariantOverrides] = useState<Record<string, VariantOverride>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const variants = useMemo(() => deriveVariants(options, variantOverrides), [options, variantOverrides]);
  const hasVariants = variants.length > 0;
  const selectedVariant = selectedIds.size === 1
    ? variants.find((v) => v.localId === [...selectedIds][0]) ?? null
    : null;
  const showInventory = !hasVariants || selectedIds.size === 1;

  // Clear stale selections when variants regenerate
  useEffect(() => {
    const validIds = new Set(variants.map((v) => v.localId));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [variants]);

  const price = parseFloat(watchPrice) || 0;
  const cost = parseFloat(watchCostPrice) || 0;
  const profit = price > 0 && cost > 0 ? price - cost : null;
  const margin = profit !== null && price > 0 ? ((profit / price) * 100).toFixed(1) : null;

  // ── Mutations ──
  const { mutateAsync: createProduct, isPending } = tanstackQueryClient.useMutation(
    "post",
    "/api/ProductCatalog/products"
  );
  const { mutateAsync: createOption } = tanstackQueryClient.useMutation(
    "post",
    "/api/ProductCatalog/products/{id}/options"
  );
  const { mutateAsync: createVariant } = tanstackQueryClient.useMutation(
    "post",
    "/api/ProductCatalog/products/{id}/variants"
  );

  // ── Options handlers ──
  const addOption = useCallback(() => {
    setOptions((p) => [...p, { localId: uid(), name: "", inputValues: [""] }]);
  }, []);

  const removeOption = useCallback((id: string) => {
    setOptions((p) => p.filter((o) => o.localId !== id));
  }, []);

  const updateOptionName = useCallback((id: string, name: string) => {
    setOptions((p) => p.map((o) => (o.localId === id ? { ...o, name } : o)));
  }, []);

  const handleValueChange = useCallback((optId: string, idx: number, val: string) => {
    setOptions((p) =>
      p.map((opt) => {
        if (opt.localId !== optId) return opt;
        const vals = opt.inputValues.map((v, i) => (i === idx ? val : v));
        if (idx === vals.length - 1 && val.trim()) vals.push("");
        return { ...opt, inputValues: vals };
      })
    );
  }, []);

  const handleValueBlur = useCallback((optId: string, idx: number) => {
    setOptions((p) =>
      p.map((opt) => {
        if (opt.localId !== optId) return opt;
        let vals = [...opt.inputValues];
        if (!vals[idx]?.trim() && vals.length > 1) vals = vals.filter((_, i) => i !== idx);
        if (!vals.length || vals[vals.length - 1].trim()) vals.push("");
        return { ...opt, inputValues: vals };
      })
    );
  }, []);

  // ── Variant override ──
  const updateVariant = useCallback((localId: string, update: Partial<VariantOverride>) => {
    setVariantOverrides((p) => ({
      ...p,
      [localId]: {
        useProductPrice: true,
        price: "",
        useProductShipping: true,
        ...(p[localId] ?? {}),
        ...update,
      },
    }));
  }, []);

  const handleVariantClick = useCallback((id: string, ctrl: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (ctrl) {
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      }
      return prev.size === 1 && prev.has(id) ? new Set() : new Set([id]);
    });
  }, []);

  // ── Submit ──
  const doSubmit = async (values: FormValues, statusOverride?: string) => {
    try {
      const finalStatus = parseInt(statusOverride ?? values.status);
      const activeOptions = options.filter(
        (o) => o.name.trim() && getFilledValues(o.inputValues).length > 0
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const productData = (await createProduct({
        body: {
          name: values.name,
          categoryName: values.categoryName || "Uncategorized",
          slug: slugify(values.name) || uid(),
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          status: finalStatus,
          price: values.price ? parseFloat(values.price) : undefined,
          compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : undefined,
          costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
          chargeTax: values.chargeTax,
          stock: !hasVariants && values.stock ? parseInt(values.stock) : undefined,
          sku: values.sku || "",
          barcode: values.barcode || "",
          trackInventory: values.trackInventory,
          allowBackorder: values.allowBackorder,
        },
      })) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      const productId = productData?.id as number | undefined;
      if (!productId) throw new Error("Missing product ID");

      if (activeOptions.length > 0) {
        const optionResults = (await Promise.all(
          activeOptions.map((opt, displayOrder) =>
            createOption({
              params: { path: { id: productId } },
              body: { name: opt.name, displayOrder, values: getFilledValues(opt.inputValues) },
            })
          )
        )) as any[];

        await Promise.all(
          variants.map((variant) =>
            createVariant({
              params: { path: { id: productId } },
              body: {
                price: !variant.useProductPrice && variant.price ? parseFloat(variant.price) : undefined,
                optionValues: variant.optionValues.map((ov) => {
                  const idx = activeOptions.findIndex((o) => o.name === ov.optionName);
                  return {
                    optionId: optionResults[idx]?.id as number | undefined,
                    optionName: ov.optionName,
                    value: ov.value,
                  };
                }),
              },
            })
          )
        );
      }

      toast.success("Product created!");
      navigate(ROUTES.products);
    } catch {
      toast.error("Failed to create product. Please try again.");
    }
  };

  const handleSave = handleSubmit((v) => doSubmit(v));
  const handleSaveDraft = handleSubmit((v) => doSubmit(v, "2"));

  // Grouped variants when 2+ active options
  const activeOptionCount = options.filter(
    (o) => o.name.trim() && getFilledValues(o.inputValues).length > 0
  ).length;

  const variantGroups = useMemo(() => {
    if (activeOptionCount < 2) return null;
    const map = new Map<string, Variant[]>();
    for (const v of variants) {
      const key = v.optionValues[0]?.value ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return map;
  }, [variants, activeOptionCount]);

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="-ml-2 gap-1.5"
          onClick={() => navigate(ROUTES.products)}
        >
          <ArrowLeftIcon className="size-4" />
          Products
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Add product</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={() => navigate(ROUTES.products)}>
            Discard
          </Button>
          <Button variant="outline" size="sm" type="button" disabled={isPending} onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button size="sm" type="button" disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* ── 2-column body ── */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
        {/* ── Left ── */}
        <div className="flex flex-col gap-4">
          {/* General */}
          <Card>
            <CardHeader><CardTitle>General</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Title *</FieldLabel>
                  <Input {...register("name", { required: "Title is required" })} placeholder="Short sleeve t-shirt" />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <Input {...register("categoryName")} placeholder="e.g. Clothing" />
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...register("description")} placeholder="Describe your product…" rows={4} />
                </Field>

                <Field>
                  <FieldLabel>Product Image</FieldLabel>
                  <Controller
                    control={control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FileUploader
                        category="product"
                        accept="image/*"
                        value={field.value ? [field.value] : []}
                        onChange={(urls) => field.onChange(urls[0] ?? "")}
                      />
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4 pt-1"
                      >
                        {([
                          { value: "1", label: "Active" },
                          { value: "2", label: "Draft" },
                          { value: "0", label: "Archived" },
                        ] as const).map(({ value, label }) => (
                          <div key={value} className="flex items-center gap-2">
                            <RadioGroupItem value={value} id={`status-${value}`} />
                            <FieldLabel htmlFor={`status-${value}`} className="font-normal cursor-pointer">
                              {label}
                            </FieldLabel>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Product Options */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Options</CardTitle>
                {options.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={options.length >= 2}
                    onClick={addOption}
                  >
                    <PlusIcon className="size-4" />
                    Add option
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {options.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Add options like size or color to create variants.
                  </p>
                  <Button variant="outline" size="sm" type="button" onClick={addOption}>
                    <PlusIcon className="size-4" />
                    Add option
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {options.map((opt) => (
                    <div key={opt.localId} className="flex flex-col gap-3 rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={opt.name}
                          onChange={(e) => updateOptionName(opt.localId, e.target.value)}
                          placeholder="Option name (e.g. Color)"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeOption(opt.localId)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Values</span>
                        {opt.inputValues.map((val, idx) => (
                          <Input
                            key={idx}
                            value={val}
                            onChange={(e) => handleValueChange(opt.localId, idx, e.target.value)}
                            onBlur={() => handleValueBlur(opt.localId, idx)}
                            placeholder={idx === opt.inputValues.length - 1 ? "Add value…" : ""}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Variants</CardTitle>
                {selectedIds.size > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline" size="icon" type="button">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toast.info(`Edit price for ${selectedIds.size} variants`)}
                      >
                        Edit price
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toast.info(`Edit inventory for ${selectedIds.size} variants`)}
                      >
                        Edit inventory
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!hasVariants ? (
                <div className="flex items-center justify-between rounded-md border border-dashed px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">Default variant</span>
                  <Badge variant="secondary">No options</Badge>
                </div>
              ) : variantGroups ? (
                <div className="flex flex-col gap-0.5">
                  {Array.from(variantGroups.entries()).map(([groupKey, groupVariants]) => {
                    const allGroupSelected = groupVariants.every((v) => selectedIds.has(v.localId));
                    return (
                      <div key={groupKey}>
                        <div
                          className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                          onClick={(e) => {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (e.ctrlKey || e.metaKey) {
                                if (allGroupSelected) groupVariants.forEach((v) => next.delete(v.localId));
                                else groupVariants.forEach((v) => next.add(v.localId));
                              } else {
                                next.clear();
                                if (!allGroupSelected || prev.size !== groupVariants.length) {
                                  groupVariants.forEach((v) => next.add(v.localId));
                                }
                              }
                              return next;
                            });
                          }}
                        >
                          <span className="flex-1 text-sm font-medium">{groupKey}</span>
                          <span className="text-xs text-muted-foreground">
                            {groupVariants.length} variants
                          </span>
                        </div>
                        {groupVariants.map((v) => (
                          <VariantRow
                            key={v.localId}
                            variant={v}
                            isSelected={selectedIds.has(v.localId)}
                            onSelect={(ctrl) => handleVariantClick(v.localId, ctrl)}
                            productPrice={watchPrice}
                            indent
                          />
                        ))}
                        <Separator className="my-1" />
                      </div>
                    );
                  })}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hold <kbd className="rounded border px-1 font-mono text-[10px]">Ctrl</kbd> to select multiple variants
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {variants.map((v) => (
                    <VariantRow
                      key={v.localId}
                      variant={v}
                      isSelected={selectedIds.has(v.localId)}
                      onSelect={(ctrl) => handleVariantClick(v.localId, ctrl)}
                      productPrice={watchPrice}
                    />
                  ))}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hold <kbd className="rounded border px-1 font-mono text-[10px]">Ctrl</kbd> to select multiple variants
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-14 lg:self-start">
          {/* Inventory */}
          {showInventory && (
            <Card>
              <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <FieldLabel>Track inventory</FieldLabel>
                    <Controller
                      control={control}
                      name="trackInventory"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </Field>

                  {watchTrackInventory && (
                    <>
                      <Field>
                        <FieldLabel>Quantity</FieldLabel>
                        <Input type="number" min="0" {...register("stock")} placeholder="0" />
                      </Field>

                      <Field>
                        <FieldLabel>SKU</FieldLabel>
                        <Input {...register("sku")} placeholder="SKU-001" />
                      </Field>

                      <Field orientation="horizontal">
                        <FieldLabel>Continue selling when out of stock</FieldLabel>
                        <Controller
                          control={control}
                          name="allowBackorder"
                          render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </Field>
                    </>
                  )}
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                {selectedVariant && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Use product price</span>
                      <span className="text-xs text-muted-foreground">{selectedVariant.label}</span>
                    </div>
                    <Switch
                      checked={selectedVariant.useProductPrice}
                      onCheckedChange={(v) =>
                        updateVariant(selectedVariant.localId, { useProductPrice: v })
                      }
                    />
                  </div>
                )}

                <Field>
                  <FieldLabel>Price (VND)</FieldLabel>
                  {selectedVariant && !selectedVariant.useProductPrice ? (
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={selectedVariant.price}
                      onChange={(e) =>
                        updateVariant(selectedVariant.localId, { price: e.target.value })
                      }
                      placeholder="0"
                    />
                  ) : (
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      {...register("price")}
                      disabled={!!selectedVariant?.useProductPrice}
                      placeholder="0"
                    />
                  )}
                </Field>

                <Field>
                  <FieldLabel>Compare-at price (VND)</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    {...register("compareAtPrice")}
                    disabled={!!selectedVariant?.useProductPrice}
                    placeholder="0"
                  />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel>Charge tax</FieldLabel>
                  <Controller
                    control={control}
                    name="chargeTax"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </Field>

                <Separator />

                <Field>
                  <FieldLabel>Cost per item (VND)</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    {...register("costPrice")}
                    placeholder="0"
                  />
                  <FieldDescription>Customers won't see this</FieldDescription>
                </Field>

                {profit !== null && (
                  <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Profit</p>
                      <p className={cn("text-sm font-medium", profit >= 0 ? "text-emerald-600" : "text-destructive")}>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className={cn("text-sm font-medium", profit >= 0 ? "text-emerald-600" : "text-destructive")}>
                        {margin}%
                      </p>
                    </div>
                  </div>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                {selectedVariant && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Use product shipping</span>
                      <span className="text-xs text-muted-foreground">{selectedVariant.label}</span>
                    </div>
                    <Switch
                      checked={selectedVariant.useProductShipping}
                      onCheckedChange={(v) =>
                        updateVariant(selectedVariant.localId, { useProductShipping: v })
                      }
                    />
                  </div>
                )}

                <Field orientation="horizontal">
                  <FieldLabel>Physical product</FieldLabel>
                  <Controller
                    control={control}
                    name="isPhysical"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </Field>

                <div className="grid grid-cols-3 gap-2">
                  {(["width", "height", "length"] as const).map((dim) => (
                    <Field key={dim}>
                      <FieldLabel>{dim.charAt(0).toUpperCase()} (cm)</FieldLabel>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...register(dim)}
                        placeholder="0"
                        disabled={!!selectedVariant?.useProductShipping}
                      />
                    </Field>
                  ))}
                </div>

                <Field>
                  <FieldLabel>Weight (kg)</FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("weight")}
                    placeholder="0"
                    disabled={!!selectedVariant?.useProductShipping}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
