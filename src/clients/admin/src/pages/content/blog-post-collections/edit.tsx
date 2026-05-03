import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useContentClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/configs/routes";

import type { BlogPostCollectionFormValues } from "./components/BlogPostCollectionFormLayout";
import { BlogPostCollectionFormLayout } from "./components/BlogPostCollectionFormLayout";

export default function EditBlogPostCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const collectionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const { data: collection, isLoading, isError } = useQuery({
    queryKey: ["blog-post-collection", collectionId],
    queryFn: () => contentClient.getAdminBlogPostCollectionById(collectionId),
    enabled: !Number.isNaN(collectionId),
  });

  const { mutateAsync: updateCollection, isPending } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { title: string; description?: string | null; isPublic: boolean; blogPostIds: number[] } }) =>
      contentClient.updateBlogPostCollection(id, input),
  });

  const handleSubmit = async (values: BlogPostCollectionFormValues, blogPostIds: number[]) => {
    await updateCollection({
      id: collectionId,
      input: {
        title: values.title,
        description: values.description || undefined,
        isPublic: values.isPublic,
        blogPostIds,
      },
    });
    toast.success("Collection updated");
    await queryClient.invalidateQueries({ queryKey: ["blog-post-collections"] });
    await queryClient.invalidateQueries({ queryKey: ["blog-post-collection", collectionId] });
    navigate(ROUTES.contentBlogCollections);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="p-6">
        <AdminErrorState
          title="Failed to load collection"
          description="Could not fetch the collection details. Please go back and try again."
        />
      </div>
    );
  }

  return (
    <BlogPostCollectionFormLayout
      pageTitle={`Edit: ${collection.title}`}
      isEdit
      isPending={isPending}
      defaultValues={{
        key: collection.key,
        title: collection.title,
        description: collection.description ?? "",
        isPublic: collection.isPublic,
      }}
      initialPosts={collection.items ?? []}
      onDiscard={() => navigate(ROUTES.contentBlogCollections)}
      onSubmit={handleSubmit}
    />
  );
}
