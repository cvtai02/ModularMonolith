import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useContentClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

import type { BlogPostFormValues } from "./components/BlogPostFormLayout";
import { BlogPostFormLayout } from "./components/BlogPostFormLayout";

export default function AddBlogPostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const { mutateAsync: createPost, isPending } = useMutation({
    mutationFn: contentClient.createBlogPost.bind(contentClient),
  });

  const handleSubmit = async (values: BlogPostFormValues) => {
    const result = await createPost({
      title: values.title,
      content: values.content,
      summary: values.summary || undefined,
      imageUrl: values.imageUrl || undefined,
    });
    toast.success("Blog post created");
    await queryClient.invalidateQueries({ queryKey: ["admin-blogs-by-collection"] });
    navigate(ROUTES.contentBlogEdit(result.id));
  };

  return (
    <BlogPostFormLayout
      pageTitle="New blog post"
      isPending={isPending}
      onDiscard={() => navigate(ROUTES.contentBlogs)}
      onSubmit={handleSubmit}
    />
  );
}
