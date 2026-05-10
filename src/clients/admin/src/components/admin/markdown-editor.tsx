import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import {
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

import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

// ─── Markdown image resolver ──────────────────────────────────────────────────

const markdownComponents: Components = {
  img({ src, alt, ...props }) {
    const resolved = resolveMediaUrl(src ?? "");
    return <img src={resolved} alt={alt} {...props} />;
  },
};

// ─── Toolbar ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write in Markdown…",
  rows = 14,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyToolbarAction(action: WrapAction | LineAction) {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;

    let newValue: string;
    let newStart: number;
    let newEnd: number;

    if (action.type === "wrap") {
      const selected = current.slice(start, end) || action.placeholder;
      newValue = current.slice(0, start) + action.prefix + selected + action.suffix + current.slice(end);
      newStart = start + action.prefix.length;
      newEnd = newStart + selected.length;
    } else {
      const lineStart = current.lastIndexOf("\n", start - 1) + 1;
      newValue = current.slice(0, lineStart) + action.prefix + current.slice(lineStart);
      newStart = start + action.prefix.length;
      newEnd = newStart;
    }

    el.value = newValue;
    onChange(newValue);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      {/* Header: title + tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <span className="text-xs text-muted-foreground font-medium">Markdown</span>
        <div className="flex items-center gap-0.5 rounded-md border p-0.5">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors",
              tab === "write"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PencilIcon className="size-3" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors",
              tab === "preview"
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
      {tab === "write" && (
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
          {TOOLBAR.map((item, i) =>
            item === "sep" ? (
              <div key={i} className="mx-0.5 h-4 w-px bg-border" />
            ) : (
              <button
                key={item.label}
                type="button"
                title={item.label}
                onClick={() => applyToolbarAction(item.action)}
                className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <item.icon className="size-3.5" />
              </button>
            )
          )}
        </div>
      )}

      {/* Body */}
      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
        />
      ) : (
        <div className="min-h-[8rem] px-4 py-3">
          {value.trim() ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown components={markdownComponents}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
