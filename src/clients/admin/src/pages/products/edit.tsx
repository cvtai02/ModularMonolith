import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useInventoryClient, useProductCatalogClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

import type { FormValues, OptionEntry, Variant, VariantOverride } from "./components/types";
import { buildMediaPayload, buildVariantsPayload, uid } from "./components/helpers";
import { urlToMediaKey } from "@/lib/media";
import { ProductFormLayout } from "./components/ProductFormLayout";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id!;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productCatalogClient = useProductCatalogClient();
  const inventoryClient = useInventoryClient();

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productCatalogClient.getProduct(productId),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productCatalogClient.listCategory({ pageSize: 200 }),
  });
  const categories = categoriesData?.items ?? [];

  const { mutateAsync: updateProduct, isPending } = useMutation({
    mutationFn: productCatalogClient.updateProduct.bind(productCatalogClient, productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product", productId] }),
  });

  const defaultValues = useMemo((): Partial<FormValues> | undefined => {
    if (!product) return undefined;
    const mediaUrls = product.medias?.length
      ? product.medias.map((m) => m.url).filter((u): u is string => !!u)
      : product.imageUrl ? [product.imageUrl] : [];
    return {
      name: product.name ?? "",
      categoryId: product.categoryId ?? 0,
      description: product.description ?? "",
      status: (product.status as string) ?? "Draft",
      mediaUrls,
      currency: product.currency ?? "VND",
      price: product.price ? String(product.price) : "",
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      costPrice: product.costPrice ? String(product.costPrice) : "",
      chargeTax: product.chargeTax ?? false,
      trackInventory: product.trackInventory ?? true,
      stock: product.stock ? String(product.stock) : "",
      allowBackorder: product.allowBackorder ?? false,
      lowStockThreshold: product.lowStockThreshold ? String(product.lowStockThreshold) : "",
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
      .map((opt) => {
        const values = opt.values ?? [];
        return {
          localId: uid(),
          name: opt.name ?? "",
          values,
          pending: "",
          initialValueCount: values.length,
        };
      });
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
        id: variant.id ?? undefined,
        imageKey: urlToMediaKey(variant.imageUrl ?? ""),
        useProductPrice: variant.useProductPricing ?? true,
        price: !variant.useProductPricing && variant.price ? String(variant.price) : "",
        compareAtPrice: !variant.useProductPricing && variant.compareAtPrice ? String(variant.compareAtPrice) : "",
        costPrice: !variant.useProductPricing && variant.costPrice ? String(variant.costPrice) : "",
        chargeTax: !variant.useProductPricing ? (variant.chargeTax ?? false) : false,
        useProductShipping: variant.useProductShipping ?? true,
        physicalProduct: !variant.useProductShipping ? (variant.physicalProduct ?? true) : true,
        weight: !variant.useProductShipping && variant.weight ? String(variant.weight) : "",
        width: !variant.useProductShipping && variant.width ? String(variant.width) : "",
        height: !variant.useProductShipping && variant.height ? String(variant.height) : "",
        length: !variant.useProductShipping && variant.length ? String(variant.length) : "",
        useProductInventory: variant.useProductInventory ?? true,
        stock: variant.stock ? String(variant.stock) : "0",
        trackInventory: variant.trackInventory ?? true,
        allowBackorder: variant.allowBackorder ?? false,
        lowStockThreshold: variant.lowStockThreshold ? String(variant.lowStockThreshold) : "",
      };
    }
    return overrides;
  }, [product, initialOptions]);

  const handleSubmit = async (values: FormValues, options: OptionEntry[], variants: Variant[], statusOverride?: string) => {
    const finalStatus = statusOverride ?? values.status;
    const hasVariants = variants.length > 0;
    const activeOptions = options.filter((o) => o.name.trim() && o.values.length > 0);

    const updated = await updateProduct({
      name: values.name,
      categoryId: values.categoryId,
      description: values.description || undefined,
      ...buildMediaPayload(values.mediaUrls),
      status: finalStatus as never,
      price: values.price ? parseFloat(values.price) : undefined,
      compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : undefined,
      costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
      chargeTax: values.chargeTax,
      stock: !hasVariants && values.stock ? parseInt(values.stock) : undefined,
      trackInventory: values.trackInventory,
      allowBackorder: values.allowBackorder,
      physicalProduct: values.isPhysical,
      weight: values.weight ? parseFloat(values.weight) : undefined,
      width: values.width ? parseFloat(values.width) : undefined,
      height: values.height ? parseFloat(values.height) : undefined,
      length: values.length ? parseFloat(values.length) : undefined,
      options: activeOptions.map((opt, displayOrder) => ({
        name: opt.name,
        displayOrder,
        values: opt.values,
      })),
      // All variants are submitted — existing ones carry their id, new combos
      // (from newly-added option values) omit id and the backend generates one.
      variants: buildVariantsPayload(variants, hasVariants),
    });

    // Second call: Inventory — uses IDs returned by the catalog.
    try {
      await inventoryClient.initializeProductInventory(updated.id!, {
        trackInventory: values.trackInventory,
        allowBackorder: values.allowBackorder,
        lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : 0,
        variants: (updated.variants ?? []).map((rv) => {
          const key = (rv.optionValues ?? [])
            .map((ov) => `${ov.optionName}:${ov.value}`)
            .join("|");
          const draft = variants.find((v) => v.localId === key);
          return {
            variantId: rv.id!,
            useProductInventory: draft?.useProductInventory ?? true,
            trackInventory: draft?.trackInventory ?? true,
            allowBackorder: draft?.allowBackorder ?? false,
            lowStockThreshold: draft?.lowStockThreshold ? parseInt(draft.lowStockThreshold) : 0,
            quantity: parseInt(draft?.stock ?? "0") || 0,
          };
        }),
      });
    } catch {
      // Catalog succeeded; inventory setup failed. Navigate so the admin can retry.
      toast.warning("Product saved, but inventory setup failed. Please retry by re-saving.");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(ROUTES.productDetail(productId));
      return;
    }

    toast.success("Product updated!");
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    navigate(ROUTES.productDetail(productId));
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
      canAddOption={false}
      onDiscard={() => navigate(ROUTES.products)}
      onSubmit={handleSubmit}
    />
  );
}
