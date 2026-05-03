import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, EyeIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { applyValidationErrors } from "@/lib/form-error";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BlogPostFormValues = {
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
};

interface Props {
  pageTitle: string;
  backLabel?: string;
  defaultValues?: Partial<BlogPostFormValues>;
  isPending: boolean;
  /** Optional extra content rendered between the sticky header and the form body (e.g. status/action bar). */
  statusBar?: ReactNode;
  onDiscard: () => void;
  onSubmit: (values: BlogPostFormValues) => Promise<void>;
}

// ─── Markdown preview ─────────────────────────────────────────────────────────
// Renders a basic styled view of raw markdown text.
// Integrate a proper parser (e.g. marked, react-markdown) for full HTML rendering.

function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
    );
  }
  return (
    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">
      {content}
    </pre>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function BlogPostFormLayout({
  pageTitle,
  backLabel = "Blog Posts",
  defaultValues,
  isPending,
  statusBar,
  onDiscard,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      imageUrl: "",
      ...defaultValues,
    },
  });

  const [contentTab, setContentTab] = useState<"write" | "preview">("write");
  const [contentPreview, setContentPreview] = useState(defaultValues?.content ?? "");

  const doSubmit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (err) {
      if (!applyValidationErrors(err, setError)) throw err;
    }
  });

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="-ml-2 gap-1.5"
          onClick={onDiscard}
        >
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

      {statusBar}

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl p-6 flex flex-col gap-6">
        {/* Meta card */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold">Details</h2>
          <FieldGroup>
            <Field>
              <FieldLabel>Title *</FieldLabel>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="Post title"
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Summary</FieldLabel>
              <Textarea
                {...register("summary")}
                placeholder="Brief summary shown in listings…"
                rows={2}
              />
            </Field>

            <Field>
              <FieldLabel>Image URL</FieldLabel>
              <Input
                {...register("imageUrl")}
                placeholder="https://…"
                type="url"
              />
            </Field>
          </FieldGroup>
        </div>

        {/* Content card with write/preview tabs */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h2 className="text-sm font-semibold">Content</h2>
            <div className="flex items-center gap-1 rounded-md border p-0.5">
              <button
                type="button"
                onClick={() => setContentTab("write")}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  contentTab === "write"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PencilIcon className="size-3" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setContentTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  contentTab === "preview"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <EyeIcon className="size-3" />
                Preview
              </button>
            </div>
          </div>

          {contentTab === "write" ? (
            <div className="p-4">
              <textarea
                {...register("content")}
                placeholder="Write your post in Markdown…"
                rows={24}
                onChange={(e) => {
                  register("content").onChange(e);
                  setContentPreview(e.target.value);
                }}
                className="w-full resize-y rounded-md border bg-transparent px-3 py-2 font-mono text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.content && (
                <p className="mt-1 text-xs text-destructive">{errors.content.message}</p>
              )}
            </div>
          ) : (
            <div className="min-h-[20rem] px-6 py-4">
              <MarkdownPreview content={contentPreview} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
