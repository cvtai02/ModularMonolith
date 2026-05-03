import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useContentClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

import type { BlogPostCollectionFormValues } from "./components/BlogPostCollectionFormLayout";
import { BlogPostCollectionFormLayout } from "./components/BlogPostCollectionFormLayout";

export default function AddBlogPostCollectionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const { mutateAsync: createCollection, isPending } = useMutation({
    mutationFn: contentClient.createBlogPostCollection.bind(contentClient),
  });

  const handleSubmit = async (values: BlogPostCollectionFormValues, blogPostIds: number[]) => {
    await createCollection({
      key: values.key,
      title: values.title,
      description: values.description || undefined,
      isPublic: values.isPublic,
      blogPostIds,
    });
    toast.success("Collection created");
    await queryClient.invalidateQueries({ queryKey: ["blog-post-collections"] });
    navigate(ROUTES.contentBlogCollections);
  };

  return (
    <BlogPostCollectionFormLayout
      pageTitle="Add blog post collection"
      isPending={isPending}
      onDiscard={() => navigate(ROUTES.contentBlogCollections)}
      onSubmit={handleSubmit}
    />
  );
}
