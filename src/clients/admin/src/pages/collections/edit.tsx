import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useProductCatalogClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";
import type { ProductResponse } from "@shared/api/contracts/productcatalog";

import type { CollectionFormValues, PickedItem } from "./components/CollectionFormLayout";
import { CollectionFormLayout } from "./components/CollectionFormLayout";

export default function EditCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const collectionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productCatalogClient = useProductCatalogClient();

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => productCatalogClient.getCollection(collectionId),
  });

  const initialProducts = useMemo<PickedItem[]>(
    () =>
      (collection?.products ?? []).map((p) => ({
        id: p.productId,
        name: p.name,
        imageUrl: p.imageUrl,
        status: p.status as unknown as string,
      })),
    [collection]
  );

  const { mutateAsync: updateCollection, isPending: isUpdating } = useMutation({
    mutationFn: (input: Parameters<typeof productCatalogClient.updateCollection>[1]) =>
      productCatalogClient.updateCollection(collectionId, input),
  });

  const { mutateAsync: addCollectionProducts, isPending: isAdding } = useMutation({
    mutationFn: (input: Parameters<typeof productCatalogClient.addCollectionProducts>[1]) =>
      productCatalogClient.addCollectionProducts(collectionId, input),
  });

  const handleSubmit = async (values: CollectionFormValues, productIds: number[] | null) => {
    await updateCollection({
      title: values.title,
      description: values.description,
      slug: values.slug,
      imageKey: null,
      productIds,
    });
    toast.success("Collection updated");
    await queryClient.invalidateQueries({ queryKey: ["collections"] });
    queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
    navigate(ROUTES.productCollections);
  };

  const handleAddProducts = async (products: ProductResponse[]) => {
    if (products.length === 0) return;
    await addCollectionProducts({ productIds: products.map((p) => p.id!) });
    toast.success(`${products.length} product${products.length > 1 ? "s" : ""} added`);
    await queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  if (isLoading || !collection) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <CollectionFormLayout
      pageTitle="Edit collection"
      defaultValues={{
        title: collection.title ?? "",
        slug: collection.slug ?? "",
        description: collection.description ?? "",
      }}
      initialProducts={initialProducts}
      isPending={isUpdating}
      isEdit
      isAdding={isAdding}
      onDiscard={() => navigate(ROUTES.productCollections)}
      onSubmit={handleSubmit}
      onAddProducts={handleAddProducts}
    />
  );
}
