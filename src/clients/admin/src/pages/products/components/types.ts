export type OptionEntry = {
  localId: string;
  name: string;
  inputValues: string[];
};

export type VariantOverride = {
  useProductPrice: boolean;
  price: string;
  useProductShipping: boolean;
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
  name: string;
  categoryId: number;
  description: string;
  status: string;
  imageUrl: string;
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
  name: "",
  categoryId: 0,
  description: "",
  status: "1",
  imageUrl: "",
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
  useProductShipping: true,
  useProductInventory: true,
  stock: "0",
  trackInventory: true,
  allowBackorder: false,
  lowStockThreshold: "",
};
