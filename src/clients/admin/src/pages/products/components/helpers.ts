import type { OptionEntry, Variant, VariantOverride } from "./types";

// ─── Media helpers ────────────────────────────────────────────────────────────

export function isMp4(url: string): boolean {
  return url.toLowerCase().endsWith(".mp4");
}

/**
 * Builds the `imageUrl` + `medias` payload from a flat list of media URLs.
 * - mp4 is placed first with type "video" and displayOrder 0.
 * - imageUrl is the first non-mp4 URL (used as the product thumbnail).
 */
export function buildMediaPayload(mediaUrls: string[]) {
  const mp4s = mediaUrls.filter(isMp4);
  const images = mediaUrls.filter((u) => !isMp4(u));
  const ordered = [...mp4s, ...images];
  return {
    imageUrl: images[0] || undefined,
    medias: ordered.map((url, i) => ({
      url,
      type: isMp4(url) ? "video" : "image",
      displayOrder: i,
    })),
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Validators for react-hook-form: keep raw text in the field, return string error
// when the value is not a non-negative number. Empty is allowed unless required is set.
export const validateNonNegativeNumber = (label: string) => (raw: string) => {
  if (raw === "" || raw === null || raw === undefined) return true;
  const n = Number(raw);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (n < 0) return `${label} must be 0 or greater`;
  return true;
};

export const validateRequiredNonNegativeNumber = (label: string) => (raw: string) => {
  if (raw === "" || raw === null || raw === undefined) return `${label} is required`;
  const n = Number(raw);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (n < 0) return `${label} must be 0 or greater`;
  return true;
};

export type VariantValidationError = {
  variantLabel: string;
  field: string;
  message: string;
};

export function validateVariantNumerics(variants: Variant[]): VariantValidationError | null {
  const numericFields: Array<{ key: keyof Variant; label: string; gate: (v: Variant) => boolean }> = [
    { key: "price", label: "price", gate: (v) => !v.useProductPrice },
    { key: "compareAtPrice", label: "compare-at price", gate: (v) => !v.useProductPrice },
    { key: "costPrice", label: "cost", gate: (v) => !v.useProductPrice },
    { key: "stock", label: "quantity", gate: () => true },
    { key: "lowStockThreshold", label: "low stock threshold", gate: (v) => !v.useProductInventory },
    { key: "weight", label: "weight", gate: (v) => !v.useProductShipping },
    { key: "width", label: "width", gate: (v) => !v.useProductShipping },
    { key: "height", label: "height", gate: (v) => !v.useProductShipping },
    { key: "length", label: "length", gate: (v) => !v.useProductShipping },
  ];

  for (const v of variants) {
    for (const { key, label, gate } of numericFields) {
      if (!gate(v)) continue;
      const raw = v[key] as string;
      if (raw === "" || raw === null || raw === undefined) continue;
      const n = Number(raw);
      if (Number.isNaN(n)) {
        return { variantLabel: v.label, field: label, message: `${label} must be a number` };
      }
      if (n < 0) {
        return { variantLabel: v.label, field: label, message: `${label} must be 0 or greater` };
      }
    }

    if (!v.useProductPrice && v.price && v.compareAtPrice) {
      const price = Number(v.price);
      const compare = Number(v.compareAtPrice);
      if (!Number.isNaN(price) && !Number.isNaN(compare) && compare > 0 && compare < price) {
        return {
          variantLabel: v.label,
          field: "compare-at price",
          message: "compare-at price must be ≥ price",
        };
      }
    }
  }

  return null;
}

export type OptionsValidationError =
  | { kind: "duplicate-name"; name: string }
  | { kind: "duplicate-value"; optionName: string; value: string }
  | { kind: "name-too-long"; name: string }
  | { kind: "no-values"; optionName: string };

export function validateOptions(options: OptionEntry[]): OptionsValidationError | null {
  const namedOptions = options.filter((o) => o.name.trim());

  for (const opt of namedOptions) {
    if (opt.name.trim().length > 100) {
      return { kind: "name-too-long", name: opt.name.trim() };
    }
  }

  // Option names must be unique (case-insensitive).
  const seenNames = new Set<string>();
  for (const opt of namedOptions) {
    const key = opt.name.trim().toLowerCase();
    if (seenNames.has(key)) return { kind: "duplicate-name", name: opt.name.trim() };
    seenNames.add(key);
  }

  // Each named option must have at least one value.
  for (const opt of namedOptions) {
    if (opt.values.length === 0) {
      return { kind: "no-values", optionName: opt.name.trim() };
    }
  }

  // Values within each option must be unique (case-insensitive).
  for (const opt of namedOptions) {
    const seen = new Set<string>();
    for (const v of opt.values) {
      const key = v.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) return { kind: "duplicate-value", optionName: opt.name.trim(), value: v };
      seen.add(key);
    }
  }

  return null;
}

export function deriveVariants(
  options: OptionEntry[],
  overrides: Record<string, VariantOverride>
): Variant[] {
  const active = options.filter((o) => o.name.trim() && o.values.length > 0);
  if (!active.length) return [];

  let combos: Array<Array<{ optionName: string; value: string }>> = [[]];
  for (const opt of active) {
    combos = combos.flatMap((c) => opt.values.map((v) => [...c, { optionName: opt.name, value: v }]));
  }

  return combos.map((combo) => {
    const localId = combo.map((c) => `${c.optionName}:${c.value}`).join("|");
    const ov = overrides[localId];
    return {
      localId,
      label: combo.map((c) => c.value).join(" / "),
      optionValues: combo,
      id: ov?.id,
      useProductPrice: ov?.useProductPrice ?? true,
      price: ov?.price ?? "",
      compareAtPrice: ov?.compareAtPrice ?? "",
      costPrice: ov?.costPrice ?? "",
      chargeTax: ov?.chargeTax ?? false,
      useProductShipping: ov?.useProductShipping ?? true,
      physicalProduct: ov?.physicalProduct ?? true,
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

type BuildVariantsOptions = {
  // When true, only include variants that already have a backend id (existing variants
  // on edit). New combos derived from newly-added option values are dropped — the backend
  // is expected to create variants for those server-side.
  existingOnly?: boolean;
};

export function buildVariantsPayload(
  variants: Variant[],
  hasVariants: boolean,
  options: BuildVariantsOptions = {},
) {
  if (!hasVariants) return [];
  const filtered = options.existingOnly ? variants.filter((v) => !!v.id) : variants;
  return filtered.map((v) => ({
    id: v.id ?? null,
    useProductPricing: v.useProductPrice,
    price: !v.useProductPrice && v.price ? parseFloat(v.price) : null,
    compareAtPrice: !v.useProductPrice && v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
    costPrice: !v.useProductPrice && v.costPrice ? parseFloat(v.costPrice) : null,
    chargeTax: !v.useProductPrice ? v.chargeTax : null,
    imageKey: v.imageKey || null,
    useProductShipping: v.useProductShipping,
    physicalProduct: !v.useProductShipping ? v.physicalProduct : null,
    weight: !v.useProductShipping && v.weight ? parseFloat(v.weight) : null,
    width: !v.useProductShipping && v.width ? parseFloat(v.width) : null,
    height: !v.useProductShipping && v.height ? parseFloat(v.height) : null,
    length: !v.useProductShipping && v.length ? parseFloat(v.length) : null,
    useProductInventory: v.useProductInventory,
    trackInventory: !v.useProductInventory ? v.trackInventory : null,
    allowBackorder: !v.useProductInventory ? v.allowBackorder : null,
    quantity: parseInt(v.stock) || 0,
    optionValues: v.optionValues.map((ov) => ({
      optionId: null,
      optionName: ov.optionName,
      value: ov.value,
    })),
  }));
}
