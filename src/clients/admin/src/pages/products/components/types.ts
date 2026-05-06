import type { CurrencyCode } from "@shared/api/contracts/common-types";

export type OptionEntry = {
  localId: string;
  name: string;
  values: string[];           // committed values
  pending: string;            // current "add value" input, committed on Enter / Blur
  initialValueCount: number;  // values[0..initialValueCount-1] came from backend (chips, not removable)
};

export type VariantOverride = {
  // Backend variant id (carried through on edit so the update payload can target
  // the existing variant). Undefined for variants generated from new option values.
  id?: string;
  useProductPrice: boolean;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  chargeTax: boolean;
  useProductShipping: boolean;
  physicalProduct: boolean;
  weight: string;
  width: string;
  height: string;
  length: string;
  useProductInventory: boolean;
  stock: string;
  trackInventory: boolean;
  allowBackorder: boolean;
  lowStockThreshold: string;
};

export type Variant = VariantOverride & {
  localId: string;
  label: string;
  optionValues: { optionName: string; value: string }[];
};

export type FormValues = {
  customId: string;
  name: string;
  categoryId: number;
  description: string;
  status: string;
  mediaUrls: string[];
  currency: CurrencyCode;
  trackInventory: boolean;
  stock: string;
  allowBackorder: boolean;
  lowStockThreshold: string;
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

export const DEFAULT_FORM_VALUES: FormValues = {
  customId: "",
  name: "",
  categoryId: 0,
  description: "",
  status: "Draft",
  mediaUrls: [],
  currency: 'VND',
  trackInventory: true,
  stock: "",
  allowBackorder: false,
  lowStockThreshold: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  chargeTax: false,
  isPhysical: true,
  weight: "",
  width: "",
  height: "",
  length: "",
};

export const DEFAULT_VARIANT_OVERRIDE: VariantOverride = {
  useProductPrice: true,
  price: "",
  compareAtPrice: "",
  costPrice: "",
  chargeTax: false,
  useProductShipping: true,
  physicalProduct: true,
  weight: "",
  width: "",
  height: "",
  length: "",
  useProductInventory: true,
  stock: "0",
  trackInventory: true,
  allowBackorder: false,
  lowStockThreshold: "",
};
