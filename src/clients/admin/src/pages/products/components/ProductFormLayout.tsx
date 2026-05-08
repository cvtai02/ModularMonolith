import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import type { CategoryResponse } from "@shared/api/types/productcatalog";
import { applyValidationErrors } from "@/lib/form-error";

import { DEFAULT_FORM_VALUES, DEFAULT_VARIANT_OVERRIDE } from "./types";
import type { FormValues, OptionEntry, Variant, VariantOverride } from "./types";
import { deriveVariants, isMp4, uid, validateOptions, validateVariantNumerics } from "./helpers";
import { GeneralSection } from "./GeneralSection";
import { OptionsSection } from "./OptionsSection";
import { VariantsSection } from "./VariantsSection";
import { InventoryCard } from "./InventoryCard";
import { PricingCard } from "./PricingCard";
import { ShippingCard } from "./ShippingCard";
import { VariantImageCard } from "./VariantImageCard";

type Props = {
  title: string;
  categories: CategoryResponse[];
  isPending: boolean;
  defaultValues?: Partial<FormValues>;
  initialOptions?: OptionEntry[];
  initialVariantOverrides?: Record<string, VariantOverride>;
  showCustomIdField?: boolean;
  // When false, hides the "Add option" button (e.g. on the edit page where backend
  // disallows adding new option names to an existing product).
  canAddOption?: boolean;
  onDiscard: () => void;
  onSubmit: (values: FormValues, options: OptionEntry[], variants: Variant[], statusOverride?: string) => Promise<void>;
};

const FIELD_MAP: Partial<Record<string, keyof FormValues>> = {
  PhysicalProduct: "isPhysical",
  // Backend slug is generated from the product name, so map slug errors back to it.
  slug: "name",
  Slug: "name",
};

export function ProductFormLayout({
  title,
  categories,
  isPending,
  defaultValues,
  initialOptions,
  initialVariantOverrides,
  showCustomIdField,
  canAddOption = true,
  onDiscard,
  onSubmit,
}: Props) {
  const { setOpen } = useSidebar();
  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { register, control, handleSubmit, watch, getValues, setError, formState: { errors } } = useForm<FormValues>({
    defaultValues: { ...DEFAULT_FORM_VALUES, ...defaultValues },
    mode: "onChange",
  });

  const watchPrice = watch("price");
  const watchCostPrice = watch("costPrice");
  const watchTrackInventory = watch("trackInventory");
  const watchIsPhysical = watch("isPhysical");

  const [options, setOptions] = useState<OptionEntry[]>(initialOptions ?? []);
  const [variantOverrides, setVariantOverrides] = useState<Record<string, VariantOverride>>(initialVariantOverrides ?? {});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const variants = useMemo(() => deriveVariants(options, variantOverrides), [options, variantOverrides]);

  const selectedVariant = selectedIds.size === 1
    ? variants.find((v) => v.localId === [...selectedIds][0]) ?? null
    : null;
  const showInventory = selectedIds.size <= 1;

  const activeOptionCount = options.filter(
    (o) => o.name.trim() && o.values.length > 0
  ).length;

  // Track duplicate option names so the UI can highlight them inline.
  const duplicateNameIds = useMemo(() => {
    const ids = new Set<string>();
    const seen = new Map<string, string>(); // lower-name → first localId
    for (const opt of options) {
      const key = opt.name.trim().toLowerCase();
      if (!key) continue;
      const existing = seen.get(key);
      if (existing) {
        ids.add(existing);
        ids.add(opt.localId);
      } else {
        seen.set(key, opt.localId);
      }
    }
    return ids;
  }, [options]);

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
    setOptions((p) => [
      ...p,
      { localId: uid(), name: "", values: [], pending: "", initialValueCount: 0 },
    ]);
  }, []);

  const removeOption = useCallback((id: string) => {
    setOptions((p) => p.filter((o) => o.localId !== id));
  }, []);

  const updateOptionName = useCallback((id: string, name: string) => {
    setOptions((p) => p.map((o) => (o.localId === id ? { ...o, name } : o)));
  }, []);

  const updatePending = useCallback((optId: string, val: string) => {
    setOptions((p) => p.map((o) => (o.localId === optId ? { ...o, pending: val } : o)));
  }, []);

  const commitPending = useCallback((optId: string) => {
    setOptions((p) =>
      p.map((opt) => {
        if (opt.localId !== optId) return opt;
        const trimmed = opt.pending.trim();
        if (!trimmed) return { ...opt, pending: "" };
        const lower = trimmed.toLowerCase();
        // Skip duplicates (case-insensitive). UI flags them; clearing pending here
        // keeps state consistent if the commit fires from blur after the user typed a dup.
        if (opt.values.some((v) => v.trim().toLowerCase() === lower)) {
          return { ...opt, pending: "" };
        }
        return { ...opt, values: [...opt.values, trimmed], pending: "" };
      })
    );
  }, []);

  const removeValue = useCallback((optId: string, idx: number) => {
    setOptions((p) =>
      p.map((opt) => {
        if (opt.localId !== optId) return opt;
        if (idx < opt.initialValueCount) return opt; // can't remove backend-original values
        return { ...opt, values: opt.values.filter((_, i) => i !== idx) };
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

  // When admin sets an image on one variant, propagate to every variant that shares
  // the same first-option value (the backend groups images by that key).
  const updateVariantImage = useCallback((localId: string, imageKey: string) => {
    const target = variants.find((v) => v.localId === localId);
    const firstOptValue = target?.optionValues[0]?.value;
    setVariantOverrides((p) => {
      const next = { ...p };
      for (const v of variants) {
        if (firstOptValue === undefined || v.optionValues[0]?.value === firstOptValue) {
          next[v.localId] = { ...DEFAULT_VARIANT_OVERRIDE, ...(p[v.localId] ?? {}), imageKey };
        }
      }
      return next;
    });
  }, [variants]);

  const bulkUpdateVariants = useCallback((ids: Set<string>, update: Partial<VariantOverride>) => {
    setVariantOverrides((p) => {
      const next = { ...p };
      ids.forEach((id) => {
        next[id] = { ...DEFAULT_VARIANT_OVERRIDE, ...(p[id] ?? {}), ...update };
      });
      return next;
    });
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
    // Validate mp4 count before anything else.
    const mp4Count = values.mediaUrls.filter(isMp4).length;
    if (mp4Count > 1) {
      toast.error("Only one video (.mp4) is allowed per product.");
      return;
    }

    // Auto-commit any pending value the user typed but didn't blur yet.
    const flushed: OptionEntry[] = options.map((opt) => {
      const trimmed = opt.pending.trim();
      if (!trimmed) return { ...opt, pending: "" };
      const lower = trimmed.toLowerCase();
      if (opt.values.some((v) => v.trim().toLowerCase() === lower)) {
        return { ...opt, pending: "" };
      }
      return { ...opt, values: [...opt.values, trimmed], pending: "" };
    });

    const validationErr = validateOptions(flushed);
    if (validationErr) {
      if (validationErr.kind === "duplicate-name") {
        toast.error(`Option "${validationErr.name}" is duplicated. Option names must be unique.`);
      } else {
        toast.error(`Value "${validationErr.value}" appears twice in option "${validationErr.optionName}".`);
      }
      return;
    }

    if (flushed !== options) setOptions(flushed);

    // Re-derive variants from the flushed options so a just-committed value is included.
    const flushedVariants = deriveVariants(flushed, variantOverrides);

    const variantErr = validateVariantNumerics(flushedVariants);
    if (variantErr) {
      toast.error(`Variant "${variantErr.variantLabel}": ${variantErr.message}.`);
      return;
    }

    try {
      await onSubmit(values, flushed, flushedVariants, statusOverride);
    } catch (err) {
      if (!applyValidationErrors(err, setError, FIELD_MAP)) {
        // Show the raw message for section-level errors (e.g. "options", "variants")
        // that don't bind to a single field.
        const message = err instanceof Error ? err.message : "Save failed.";
        toast.error(message);
      }
    }
  };

  const handleSave = handleSubmit((v) => doSubmit(v));
  const handleSaveDraft = handleSubmit((v) => doSubmit(v, "Draft"));

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
          {showCustomIdField && (
            <div className="rounded-xl border bg-card p-5 flex flex-col gap-2">
              <label className="text-sm font-medium">Product ID (optional)</label>
              <input
                {...register("customId")}
                maxLength={64}
                placeholder="Leave blank to auto-generate"
                className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring w-full"
              />
              <p className="text-xs text-muted-foreground">Stable string identifier — max 64 characters. Must be unique.</p>
            </div>
          )}
          <OptionsSection
            options={options}
            canAddOption={canAddOption}
            onAdd={addOption}
            onRemoveOption={removeOption}
            onNameChange={updateOptionName}
            onPendingChange={updatePending}
            onCommitPending={commitPending}
            onRemoveValue={removeValue}
            duplicateNameIds={duplicateNameIds}
          />
          <VariantsSection
            variants={variants}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onVariantClick={handleVariantClick}
            variantGroups={variantGroups}
            productPrice={watchPrice}
            onBulkUpdateVariants={bulkUpdateVariants}
          />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-14 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto *:shrink-0">
          {selectedVariant && (
            <VariantImageCard
              selectedVariant={selectedVariant}
              onChangeImage={(imageKey) => updateVariantImage(selectedVariant.localId, imageKey)}
            />
          )}
          <PricingCard
            register={register}
            control={control}
            errors={errors}
            watchPrice={watchPrice}
            watchCostPrice={watchCostPrice}
            selectedVariant={selectedVariant}
            onUpdateVariant={updateVariant}
            getProductValues={getValues}
          />
          {showInventory && (
            <InventoryCard
              register={register}
              control={control}
              errors={errors}
              watchTrackInventory={watchTrackInventory}
              selectedVariant={selectedVariant}
              onUpdateVariant={updateVariant}
              getProductValues={getValues}
            />
          )}
          <ShippingCard
            register={register}
            control={control}
            errors={errors}
            selectedVariant={selectedVariant}
            onUpdateVariant={updateVariant}
            watchIsPhysical={watchIsPhysical}
            getProductValues={getValues}
          />
        </div>
      </div>
    </div>
  );
}
