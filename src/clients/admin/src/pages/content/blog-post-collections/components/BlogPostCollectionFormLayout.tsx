import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FileTextIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { applyValidationErrors } from "@/lib/form-error";
import type { BlogPostSummary } from "@shared/api/contracts/content";

import { BlogPostPickerModal } from "./BlogPostPickerModal";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BlogPostCollectionFormValues = {
  key: string;
  title: string;
  description: string;
  isPublic: boolean;
};

interface Props {
  pageTitle: string;
  backLabel?: string;
  defaultValues?: Partial<BlogPostCollectionFormValues>;
  initialPosts?: BlogPostSummary[];
  isPending: boolean;
  isEdit?: boolean;
  onDiscard: () => void;
  onSubmit: (values: BlogPostCollectionFormValues, blogPostIds: number[]) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function keyify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 100);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Published")
    return (
      <Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Published
      </Badge>
    );
  if (status === "Draft")
    return <Badge variant="secondary" className="shrink-0 text-xs font-normal">Draft</Badge>;
  if (status === "Archived")
    return <Badge variant="outline" className="shrink-0 text-xs font-normal">Archived</Badge>;
  return null;
}

// ─── Post row ────────────────────────────────────────────────────────────────

function PickedPostRow({
  post,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  post: BlogPostSummary;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Move up"
        >
          <ArrowUpIcon className="size-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Move down"
        >
          <ArrowDownIcon className="size-3" />
        </button>
      </div>

      <Avatar className="size-8 shrink-0 rounded-md">
        <AvatarImage src={post.imageUrl ?? undefined} alt={post.title} />
        <AvatarFallback className="rounded-md text-[10px] font-medium">
          {post.title.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{post.title}</p>
        <p className="truncate text-xs text-muted-foreground font-mono">{post.slug}</p>
      </div>

      <StatusBadge status={post.status} />

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${post.title}`}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function BlogPostCollectionFormLayout({
  pageTitle,
  backLabel = "Blog Collections",
  defaultValues,
  initialPosts,
  isPending,
  isEdit = false,
  onDiscard,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BlogPostCollectionFormValues>({
    defaultValues: {
      key: "",
      title: "",
      description: "",
      isPublic: false,
      ...defaultValues,
    },
  });

  const [isPublic, setIsPublic] = useState(defaultValues?.isPublic ?? false);

  const [pickedPosts, setPickedPosts] = useState<BlogPostSummary[]>(initialPosts ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [prevInitialPosts, setPrevInitialPosts] = useState(initialPosts);
  if (prevInitialPosts !== initialPosts) {
    setPrevInitialPosts(initialPosts);
    setPickedPosts(initialPosts ?? []);
  }

  const pickedIds = new Set(pickedPosts.map((p) => p.id));

  function addFromPicker(posts: BlogPostSummary[]) {
    setPickedPosts((prev) => [...prev, ...posts]);
  }

  function removePost(id: number) {
    setPickedPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function movePost(index: number, direction: "up" | "down") {
    setPickedPosts((prev) => {
      const next = [...prev];
      const swapWith = direction === "up" ? index - 1 : index + 1;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit) setValue("key", keyify(e.target.value));
  }

  const doSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values, pickedPosts.map((p) => p.id));
    } catch (err) {
      if (!applyValidationErrors(err, setError, { Key: "key" })) throw err;
    }
  });

  const hasNonPublishedInPublic = isPublic && pickedPosts.some((p) => p.status !== "Published");

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" type="button" className="-ml-2 gap-1.5" onClick={onDiscard}>
          <ArrowLeftIcon className="size-4" />
          {backLabel}
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" type="button" disabled={isPending} onClick={doSubmit}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl p-6 flex flex-col gap-6">
        {/* Details card */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Details</h2>
          <FieldGroup>
            <Field>
              <FieldLabel>Title *</FieldLabel>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="e.g. Editor's Picks"
                onChange={(e) => {
                  register("title").onChange(e);
                  onTitleChange(e);
                }}
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Key {isEdit ? "" : "*"}</FieldLabel>
              {isEdit ? (
                <Input
                  {...register("key")}
                  readOnly
                  className="font-mono text-sm bg-muted cursor-not-allowed"
                />
              ) : (
                <Input
                  {...register("key", {
                    required: "Key is required",
                    pattern: {
                      value: /^[a-z0-9_-]+$/,
                      message: "Key can only contain lowercase letters, numbers, hyphens, and underscores",
                    },
                  })}
                  placeholder="editors-picks"
                  className="font-mono text-sm"
                />
              )}
              {isEdit ? (
                <p className="text-xs text-muted-foreground">Key cannot be changed after creation.</p>
              ) : null}
              {errors.key && <FieldError>{errors.key.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                {...register("description")}
                placeholder="Briefly describe this collection…"
                rows={3}
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel className="mb-0">Public</FieldLabel>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Public collections are visible to customers. Only published posts can be included.
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={(v) => {
                    setIsPublic(v);
                    setValue("isPublic", v);
                  }}
                />
              </div>
            </Field>
          </FieldGroup>
        </div>

        {/* Blog posts card */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b">
            <div>
              <h2 className="text-sm font-semibold">Blog Posts</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Post order here is the display order. Updating replaces the full list.
              </p>
            </div>
          </div>

          {hasNonPublishedInPublic && (
            <div className="px-6 py-2 bg-amber-50 dark:bg-amber-950/30 border-b">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This public collection contains non-published posts. The backend will reject them on save.
                Remove drafts and archived posts, or switch to private.
              </p>
            </div>
          )}

          {pickedPosts.length > 0 ? (
            <div>
              <div className="divide-y">
                {pickedPosts.map((post, index) => (
                  <div key={post.id} className="px-4">
                    <PickedPostRow
                      post={post}
                      index={index}
                      total={pickedPosts.length}
                      onRemove={() => removePost(post.id)}
                      onMoveUp={() => movePost(index, "up")}
                      onMoveDown={() => movePost(index, "down")}
                    />
                  </div>
                ))}
              </div>
              <div className="border-t px-4 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setPickerOpen(true)}
                >
                  <PlusIcon className="size-3.5" />
                  Add more
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-6">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
              >
                <FileTextIcon className="size-4" />
                Browse blog posts…
              </button>
            </div>
          )}
        </div>
      </div>

      <BlogPostPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        alreadyPickedIds={pickedIds}
        publishedOnly={isPublic}
        onConfirm={addFromPicker}
      />
    </div>
  );
}
