import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import type { CategoryResponse } from "@shared/api/api-types";

import { DEFAULT_FORM_VALUES, DEFAULT_VARIANT_OVERRIDE } from "./types";
import type { FormValues, OptionEntry, Variant, VariantOverride } from "./types";
import { deriveVariants, getFilledValues, uid } from "./helpers";
import { GeneralSection } from "./GeneralSection";
import { OptionsSection } from "./OptionsSection";
import { VariantsSection } from "./VariantsSection";
import { InventoryCard } from "./InventoryCard";
import { PricingCard } from "./PricingCard";
import { ShippingCard } from "./ShippingCard";

type Props = {
  title: string;
  categories: CategoryResponse[];
  isPending: boolean;
  defaultValues?: Partial<FormValues>;
  initialOptions?: OptionEntry[];
  initialVariantOverrides?: Record<string, VariantOverride>;
  onDiscard: () => void;
  onSubmit: (values: FormValues, options: OptionEntry[], variants: Variant[], statusOverride?: string) => Promise<void>;
};

export function ProductFormLayout({
  title,
  categories,
  isPending,
  defaultValues,
  initialOptions,
  initialVariantOverrides,
  onDiscard,
  onSubmit,
}: Props) {
  const { setOpen } = useSidebar();
  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { ...DEFAULT_FORM_VALUES, ...defaultValues },
  });

  const watchPrice = watch("price");
  const watchCostPrice = watch("costPrice");
  const watchTrackInventory = watch("trackInventory");

  const [options, setOptions] = useState<OptionEntry[]>(initialOptions ?? []);
  const [variantOverrides, setVariantOverrides] = useState<Record<string, VariantOverride>>(initialVariantOverrides ?? {});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const variants = useMemo(() => deriveVariants(options, variantOverrides), [options, variantOverrides]);
  const hasVariants = variants.length > 0;

  const selectedVariant = selectedIds.size === 1
    ? variants.find((v) => v.localId === [...selectedIds][0]) ?? null
    : null;
  const showInventory = !hasVariants || selectedIds.size === 1;

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

  useEffect(() => {
    const validIds = new Set(variants.map((v) => v.localId));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [variants]);

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
      [localId]: { ...DEFAULT_VARIANT_OVERRIDE, ...(p[localId] ?? {}), ...update },
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
    await onSubmit(values, options, variants, statusOverride);
  };

  const handleSave = handleSubmit((v) => doSubmit(v));
  const handleSaveDraft = handleSubmit((v) => doSubmit(v, "2"));

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" type="button" className="-ml-2 gap-1.5" onClick={onDiscard}>
          <ArrowLeftIcon className="size-4" />
          Products
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onDiscard}>
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

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <GeneralSection register={register} control={control} errors={errors} categories={categories} />
          <OptionsSection
            options={options}
            onAdd={addOption}
            onRemove={removeOption}
            onNameChange={updateOptionName}
            onValueChange={handleValueChange}
            onValueBlur={handleValueBlur}
          />
          <VariantsSection
            variants={variants}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onVariantClick={handleVariantClick}
            variantGroups={variantGroups}
            productPrice={watchPrice}
          />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-14 lg:self-start">
          <PricingCard
            register={register}
            control={control}
            watchPrice={watchPrice}
            watchCostPrice={watchCostPrice}
            selectedVariant={selectedVariant}
            onUpdateVariant={updateVariant}
          />
          {showInventory && (
            <InventoryCard
              register={register}
              control={control}
              watchTrackInventory={watchTrackInventory}
              selectedVariant={selectedVariant}
              onUpdateVariant={updateVariant}
            />
          )}
          <ShippingCard
            register={register}
            control={control}
            selectedVariant={selectedVariant}
            onUpdateVariant={updateVariant}
          />
        </div>
      </div>
    </div>
  );
}
