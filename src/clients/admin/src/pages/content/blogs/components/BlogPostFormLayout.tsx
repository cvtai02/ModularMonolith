import { type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { SingleImagePickerField } from "@/components/admin/image-picker-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { applyValidationErrors } from "@/lib/form-error";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BlogPostFormValues = {
  title: string;
  content: string;
  summary: string;
  imageKey: string;
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
    control,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      imageKey: "",
      ...defaultValues,
    },
  });

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
              <FieldLabel>Image</FieldLabel>
              <Controller
                control={control}
                name="imageKey"
                render={({ field }) => (
                  <SingleImagePickerField value={field.value} onChange={field.onChange} />
                )}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* Content */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-3 border-b">
            <h2 className="text-sm font-semibold">Content</h2>
          </div>
          <div className="p-4">
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write your post in Markdown…"
                  rows={24}
                  className="border-0 rounded-none"
                />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-destructive">{errors.content.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
