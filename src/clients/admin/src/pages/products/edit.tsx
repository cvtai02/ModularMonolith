import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { tanstackQueryClient } from "@/api/api-client";
import { ROUTES } from "@/configs/routes";

import type { FormValues, OptionEntry, Variant, VariantOverride } from "./components/types";
import { buildVariantsPayload, getFilledValues, uid } from "./components/helpers";
import { ProductFormLayout } from "./components/ProductFormLayout";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const { data: product, isLoading: loadingProduct } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/products/{id}",
    { params: { path: { id: productId } } }
  );

  const { data: categoriesData } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/categories",
    { params: { query: { pageSize: 200 } } }
  );
  const categories = categoriesData?.items ?? [];

  const { mutateAsync: updateProduct, isPending } = tanstackQueryClient.useMutation(
    "put",
    "/api/ProductCatalog/products/{id}"
  );

  const defaultValues = useMemo((): Partial<FormValues> | undefined => {
    if (!product) return undefined;
    return {
      name: product.name ?? "",
      categoryId: product.categoryId ?? 0,
      description: product.description ?? "",
      status: String(product.status ?? 1),
      imageUrl: product.imageUrl ?? "",
      currency: product.currency ?? 0,
      price: product.price ? String(product.price) : "",
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      costPrice: product.costPrice ? String(product.costPrice) : "",
      chargeTax: product.chargeTax ?? false,
      trackInventory: product.trackInventory ?? true,
      stock: product.stock ? String(product.stock) : "",
      allowBackorder: product.allowBackorder ?? false,
      lowStockThreshold: "",
      isPhysical: product.physicalProduct ?? true,
      weight: product.weight ? String(product.weight) : "",
      width: product.width ? String(product.width) : "",
      height: product.height ? String(product.height) : "",
      length: product.length ? String(product.length) : "",
    };
  }, [product]);

  const initialOptions = useMemo((): OptionEntry[] | undefined => {
    if (!product) return undefined;
    return (product.options ?? [])
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((opt) => ({
        localId: uid(),
        name: opt.name ?? "",
        inputValues: [...(opt.values ?? []), ""],
      }));
  }, [product]);

  const initialVariantOverrides = useMemo((): Record<string, VariantOverride> | undefined => {
    if (!product || !initialOptions) return undefined;
    const overrides: Record<string, VariantOverride> = {};
    for (const variant of product.variants ?? []) {
      if (!variant.optionValues?.length) continue;
      const localId = initialOptions
        .filter((o) => o.name.trim())
        .map((opt) => {
          const ov = variant.optionValues?.find((v) => v.optionName === opt.name);
          return `${opt.name}:${ov?.value ?? ""}`;
        })
        .join("|");
      overrides[localId] = {
        useProductPrice: variant.useProductPricing ?? true,
        price: !variant.useProductPricing && variant.price ? String(variant.price) : "",
        compareAtPrice: !variant.useProductPricing && variant.compareAtPrice ? String(variant.compareAtPrice) : "",
        costPrice: !variant.useProductPricing && variant.costPrice ? String(variant.costPrice) : "",
        chargeTax: !variant.useProductPricing ? (variant.chargeTax ?? false) : false,
        useProductShipping: variant.useProductShipping ?? true,
        weight: !variant.useProductShipping && variant.weight ? String(variant.weight) : "",
        width: !variant.useProductShipping && variant.width ? String(variant.width) : "",
        height: !variant.useProductShipping && variant.height ? String(variant.height) : "",
        length: !variant.useProductShipping && variant.length ? String(variant.length) : "",
        useProductInventory: true,
        stock: variant.stock ? String(variant.stock) : "0",
        trackInventory: variant.trackInventory ?? true,
        allowBackorder: variant.allowBackorder ?? false,
        lowStockThreshold: variant.lowStockThreshold ? String(variant.lowStockThreshold) : "",
      };
    }
    return overrides;
  }, [product, initialOptions]);

  const handleSubmit = async (values: FormValues, options: OptionEntry[], variants: Variant[], statusOverride?: string) => {
    try {
      const finalStatus = parseInt(statusOverride ?? values.status);
      const hasVariants = variants.length > 0;
      const activeOptions = options.filter(
        (o) => o.name.trim() && getFilledValues(o.inputValues).length > 0
      );

      await updateProduct({
        params: { path: { id: productId } },
        body: {
          name: values.name,
          categoryId: values.categoryId,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          status: finalStatus,
          price: values.price ? parseFloat(values.price) : undefined,
          compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : undefined,
          costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
          chargeTax: values.chargeTax,
          stock: !hasVariants && values.stock ? parseInt(values.stock) : undefined,
          trackInventory: values.trackInventory,
          allowBackorder: values.allowBackorder,
          lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : undefined,
          physicalProduct: values.isPhysical,
          weight: values.weight ? parseFloat(values.weight) : undefined,
          width: values.width ? parseFloat(values.width) : undefined,
          height: values.height ? parseFloat(values.height) : undefined,
          length: values.length ? parseFloat(values.length) : undefined,
          options: activeOptions.map((opt, displayOrder) => ({
            name: opt.name,
            displayOrder,
            values: getFilledValues(opt.inputValues),
          })),
          variants: buildVariantsPayload(variants, hasVariants),
        },
      });

      toast.success("Product updated!");
      navigate(ROUTES.products);
    } catch {
      toast.error("Failed to update product. Please try again.");
    }
  };

  if (loadingProduct || !product || !initialOptions || !defaultValues) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <ProductFormLayout
      title="Edit product"
      categories={categories}
      isPending={isPending}
      defaultValues={defaultValues}
      initialOptions={initialOptions}
      initialVariantOverrides={initialVariantOverrides}
      onDiscard={() => navigate(ROUTES.products)}
      onSubmit={handleSubmit}
    />
  );
}
