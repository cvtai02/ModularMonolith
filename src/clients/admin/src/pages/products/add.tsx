import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useInventoryClient, useProductCatalogClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

import type { FormValues, OptionEntry, Variant } from "./components/types";
import { buildMediaPayload, buildVariantsPayload } from "./components/helpers";
import { ProductFormLayout } from "./components/ProductFormLayout";

export default function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productCatalogClient = useProductCatalogClient();
  const inventoryClient = useInventoryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productCatalogClient.listCategory({ pageSize: 200 }),
  });
  const categories = categoriesData?.items ?? [];

  const { mutateAsync: createProduct, isPending } = useMutation({
    mutationFn: productCatalogClient.createProduct.bind(productCatalogClient),
  });

  const handleSubmit = async (values: FormValues, options: OptionEntry[], variants: Variant[], statusOverride?: string) => {
    const finalStatus = statusOverride ?? values.status;
    const hasVariants = variants.length > 0;
    const activeOptions = options.filter((o) => o.name.trim() && o.values.length > 0);

    const created = await createProduct({
      id: values.customId.trim() || undefined,
      name: values.name,
      categoryId: values.categoryId,
      description: values.description || undefined,
      ...buildMediaPayload(values.mediaUrls),
      status: finalStatus as never,
      currency: values.currency,
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
      variants: buildVariantsPayload(variants, hasVariants),
    });

    // Second call: Inventory — uses IDs returned by the catalog.
    try {
      await inventoryClient.initializeProductInventory(created.id!, {
        trackInventory: values.trackInventory,
        allowBackorder: values.allowBackorder,
        lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : 0,
        variants: (created.variants ?? []).map((rv) => {
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
      toast.warning("Product saved, but inventory setup failed. Open the product to retry.");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(ROUTES.productDetail(created.id!));
      return;
    }

    toast.success("Product created!");
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    navigate(ROUTES.productDetail(created.id!));
  };

  return (
    <ProductFormLayout
      title="Add product"
      categories={categories}
      isPending={isPending}
      showCustomIdField
      onDiscard={() => navigate(ROUTES.products)}
      onSubmit={handleSubmit}
    />
  );
}
