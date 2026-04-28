import type { OptionEntry, Variant, VariantOverride } from "./types";

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function getFilledValues(inputs: string[]) {
  return inputs.filter((v) => v.trim());
}

export function deriveVariants(
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
      useProductInventory: ov?.useProductInventory ?? true,
      stock: ov?.stock ?? "0",
      trackInventory: ov?.trackInventory ?? true,
      allowBackorder: ov?.allowBackorder ?? false,
      lowStockThreshold: ov?.lowStockThreshold ?? "",
    };
  });
}

export function buildVariantsPayload(variants: Variant[], hasVariants: boolean) {
  if (!hasVariants) return [];
  return variants.map((variant) => ({
    useProductPricing: variant.useProductPrice,
    price: !variant.useProductPrice && variant.price ? parseFloat(variant.price) : undefined,
    useProductShipping: variant.useProductShipping,
    useProductInventory: variant.useProductInventory,
    trackInventory: variant.useProductInventory ? undefined : variant.trackInventory,
    allowBackorder: variant.useProductInventory ? undefined : variant.allowBackorder,
    quantity: parseInt(variant.stock) || 0,
    optionValues: variant.optionValues.map((ov) => ({
      optionName: ov.optionName,
      value: ov.value,
    })),
  }));
}
