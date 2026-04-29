import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { tanstackQueryClient } from "@/api/api-client";
import { ROUTES } from "@/configs/routes";

import type { FormValues, OptionEntry, Variant } from "./components/types";
import { buildVariantsPayload, getFilledValues } from "./components/helpers";
import { ProductFormLayout } from "./components/ProductFormLayout";

export default function AddProductPage() {
  const navigate = useNavigate();

  const { data: categoriesData } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/categories",
    { params: { query: { pageSize: 200 } } }
  );
  const categories = categoriesData?.items ?? [];

  const { mutateAsync: createProduct, isPending } = tanstackQueryClient.useMutation(
    "post",
    "/api/ProductCatalog/products"
  );

  const handleSubmit = async (values: FormValues, options: OptionEntry[], variants: Variant[], statusOverride?: string) => {
    try {
      const finalStatus = parseInt(statusOverride ?? values.status);
      const hasVariants = variants.length > 0;
      const activeOptions = options.filter(
        (o) => o.name.trim() && getFilledValues(o.inputValues).length > 0
      );

      await createProduct({
        body: {
          name: values.name,
          categoryId: values.categoryId,
          description: values.description || undefined,
          imageUrl: values.imageUrl || undefined,
          status: finalStatus,
          currency: values.currency,
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

      toast.success("Product created!");
      navigate(ROUTES.products);
    } catch {
      toast.error("Failed to create product. Please try again.");
    }
  };

  return (
    <ProductFormLayout
      title="Add product"
      categories={categories}
      isPending={isPending}
      isCreating
      onDiscard={() => navigate(ROUTES.products)}
      onSubmit={handleSubmit}
    />
  );
}
