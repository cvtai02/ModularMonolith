import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useProductCatalogClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

import type { CollectionFormValues } from "./components/CollectionFormLayout";
import { CollectionFormLayout } from "./components/CollectionFormLayout";

export default function AddCollectionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productCatalogClient = useProductCatalogClient();

  const { mutateAsync: createCollection, isPending } = useMutation({
    mutationFn: productCatalogClient.createCollection.bind(productCatalogClient),
  });

  const handleSubmit = async (values: CollectionFormValues, productIds: number[] | null) => {
    await createCollection({
      title: values.title,
      slug: values.slug || undefined,
      description: values.description || undefined,
      ...(productIds?.length ? { productIds } : {}),
    });
    toast.success("Collection created");
    await queryClient.invalidateQueries({ queryKey: ["collections"] });
    navigate(ROUTES.productCollections);
  };

  return (
    <CollectionFormLayout
      pageTitle="Add collection"
      isPending={isPending}
      onDiscard={() => navigate(ROUTES.productCollections)}
      onSubmit={handleSubmit}
    />
  );
}
