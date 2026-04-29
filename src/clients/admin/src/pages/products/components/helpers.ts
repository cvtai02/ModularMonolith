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
      compareAtPrice: ov?.compareAtPrice ?? "",
      costPrice: ov?.costPrice ?? "",
      chargeTax: ov?.chargeTax ?? false,
      useProductShipping: ov?.useProductShipping ?? true,
      weight: ov?.weight ?? "",
      width: ov?.width ?? "",
      height: ov?.height ?? "",
      length: ov?.length ?? "",
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
  return variants.map((v) => ({
    useProductPricing: v.useProductPrice,
    price: !v.useProductPrice && v.price ? parseFloat(v.price) : null,
    compareAtPrice: !v.useProductPrice && v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
    costPrice: !v.useProductPrice && v.costPrice ? parseFloat(v.costPrice) : null,
    chargeTax: !v.useProductPrice ? v.chargeTax : null,
    imageKey: null,
    useProductShipping: v.useProductShipping,
    physicalProduct: null,
    weight: !v.useProductShipping && v.weight ? parseFloat(v.weight) : null,
    width: !v.useProductShipping && v.width ? parseFloat(v.width) : null,
    height: !v.useProductShipping && v.height ? parseFloat(v.height) : null,
    length: !v.useProductShipping && v.length ? parseFloat(v.length) : null,
    useProductInventory: v.useProductInventory,
    trackInventory: !v.useProductInventory ? v.trackInventory : null,
    allowBackorder: !v.useProductInventory ? v.allowBackorder : null,
    lowStockThreshold: !v.useProductInventory && v.lowStockThreshold ? parseInt(v.lowStockThreshold) : null,
    quantity: parseInt(v.stock) || 0,
    optionValues: v.optionValues.map((ov) => ({
      optionId: null,
      optionName: ov.optionName,
      value: ov.value,
    })),
  }));
}
