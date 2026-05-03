import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useContentClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/configs/routes";

import type { BlogPostFormValues } from "./components/BlogPostFormLayout";
import { BlogPostFormLayout } from "./components/BlogPostFormLayout";

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["admin-blog-post", postId],
    queryFn: () => contentClient.getAdminBlogPostById(postId),
    enabled: !Number.isNaN(postId),
  });

  const { mutateAsync: updatePost, isPending: isSaving } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { title: string; content: string; summary?: string | null; imageUrl?: string | null } }) =>
      contentClient.updateBlogPost(id, input),
  });

  const { mutateAsync: publishPost, isPending: isPublishing } = useMutation({
    mutationFn: (id: number) => contentClient.publishBlogPost(id),
  });

  const { mutateAsync: archivePost, isPending: isArchiving } = useMutation({
    mutationFn: (id: number) => contentClient.archiveBlogPost(id),
  });

  const isPending = isSaving || isPublishing || isArchiving;

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-blogs-by-collection"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-blog-post", postId] }),
    ]);
  }

  const handleSubmit = async (values: BlogPostFormValues) => {
    await updatePost({
      id: postId,
      input: {
        title: values.title,
        content: values.content,
        summary: values.summary || undefined,
        imageUrl: values.imageUrl || undefined,
      },
    });
    toast.success("Blog post saved");
    await invalidate();
  };

  async function handlePublish() {
    await publishPost(postId);
    toast.success("Blog post published");
    await invalidate();
  }

  async function handleArchive() {
    await archivePost(postId);
    toast.success("Blog post archived");
    await invalidate();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="p-6">
        <AdminErrorState
          title="Failed to load blog post"
          description="Could not fetch this post. It may have been deleted."
        />
      </div>
    );
  }

  const statusBar = (
    <div className="flex items-center gap-2 border-b bg-muted/30 px-6 py-2">
      <span className="text-xs text-muted-foreground">
        Status: <strong>{post.status}</strong>
      </span>
      <div className="ml-auto flex items-center gap-2">
        {post.status !== "Published" && (
          <Button variant="outline" size="sm" disabled={isPending} onClick={handlePublish}>
            {isPublishing ? "Publishing…" : "Publish"}
          </Button>
        )}
        {post.status !== "Archived" && (
          <Button variant="outline" size="sm" disabled={isPending} onClick={handleArchive}>
            {isArchiving ? "Archiving…" : "Archive"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <BlogPostFormLayout
      pageTitle={post.title}
      isPending={isSaving}
      statusBar={statusBar}
      defaultValues={{
        title: post.title,
        content: post.content ?? "",
        summary: post.summary ?? "",
        imageUrl: post.imageUrl ?? "",
      }}
      onDiscard={() => navigate(ROUTES.contentBlogs)}
      onSubmit={handleSubmit}
    />
  );
}
