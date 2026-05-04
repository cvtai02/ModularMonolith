import { type ReactNode, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Controller, useForm } from "react-hook-form";
import {
  ArrowLeftIcon,
  Bold,
  Code,
  EyeIcon,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  PencilIcon,
  Strikethrough,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { SingleImagePickerField } from "@/components/admin/image-picker-field";
import { resolveMediaUrl } from "@/lib/media";

const markdownComponents: Components = {
  img({ src, alt, ...props }) {
    const resolved = resolveMediaUrl(src ?? "");
    return <img src={resolved} alt={alt} {...props} />;
  },
};
import { applyValidationErrors } from "@/lib/form-error";
import { cn } from "@/lib/utils";

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

// ─── Markdown preview ─────────────────────────────────────────────────────────

function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
    );
  }
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

type WrapAction = { type: "wrap"; prefix: string; suffix: string; placeholder: string };
type LineAction = { type: "line"; prefix: string };
type ToolbarItem =
  | { icon: React.ElementType; label: string; action: WrapAction | LineAction }
  | "sep";

const TOOLBAR: ToolbarItem[] = [
  { icon: Bold, label: "Bold", action: { type: "wrap", prefix: "**", suffix: "**", placeholder: "bold text" } },
  { icon: Italic, label: "Italic", action: { type: "wrap", prefix: "*", suffix: "*", placeholder: "italic text" } },
  { icon: Strikethrough, label: "Strikethrough", action: { type: "wrap", prefix: "~~", suffix: "~~", placeholder: "strikethrough" } },
  "sep",
  { icon: Heading1, label: "Heading 1", action: { type: "line", prefix: "# " } },
  { icon: Heading2, label: "Heading 2", action: { type: "line", prefix: "## " } },
  "sep",
  { icon: List, label: "Bullet list", action: { type: "line", prefix: "- " } },
  { icon: ListOrdered, label: "Numbered list", action: { type: "line", prefix: "1. " } },
  "sep",
  { icon: Link, label: "Link", action: { type: "wrap", prefix: "[", suffix: "](url)", placeholder: "link text" } },
  { icon: ImageIcon, label: "Image", action: { type: "wrap", prefix: "![", suffix: "](url)", placeholder: "alt text" } },
  "sep",
  { icon: Code, label: "Inline code", action: { type: "wrap", prefix: "`", suffix: "`", placeholder: "code" } },
];

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
    setValue,
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

  const [contentTab, setContentTab] = useState<"write" | "preview">("write");
  const [contentPreview, setContentPreview] = useState(defaultValues?.content ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { ref: registerRef, ...contentRest } = register("content");

  function applyToolbarAction(action: WrapAction | LineAction) {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;

    let newValue: string;
    let newStart: number;
    let newEnd: number;

    if (action.type === "wrap") {
      const selected = value.slice(start, end) || action.placeholder;
      newValue = value.slice(0, start) + action.prefix + selected + action.suffix + value.slice(end);
      newStart = start + action.prefix.length;
      newEnd = newStart + selected.length;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      newValue = value.slice(0, lineStart) + action.prefix + value.slice(lineStart);
      newStart = start + action.prefix.length;
      newEnd = newStart;
    }

    el.value = newValue;
    setValue("content", newValue, { shouldDirty: true });
    setContentPreview(newValue);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });
  }

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

          {/* Toolbar — write mode only */}
          {contentTab === "write" && (
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
              {TOOLBAR.map((item, i) =>
                item === "sep" ? (
                  <div key={i} className="mx-1 h-4 w-px bg-border" />
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    title={item.label}
                    onClick={() => applyToolbarAction(item.action)}
                    className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <item.icon className="size-3.5" />
                  </button>
                )
              )}
            </div>
          )}

          {contentTab === "write" ? (
            <div className="p-4">
              <textarea
                {...contentRest}
                ref={(el) => {
                  textareaRef.current = el;
                  registerRef(el);
                }}
                placeholder="Write your post in Markdown…"
                rows={24}
                onChange={(e) => {
                  contentRest.onChange(e);
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
