import { useCallback, useRef, useState } from "react";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tanstackQueryClient } from "@/api/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FileCategory = "product" | "avatar" | "review" | "content";

interface UploadState {
  name: string;
  status: "uploading" | "done" | "error";
}

export interface FileUploaderProps {
  category: FileCategory;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExt(file: File): string {
  const dot = file.name.lastIndexOf(".");
  return dot >= 0 ? file.name.slice(dot).toLowerCase() : ".bin";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FileUploader({
  category,
  accept = "image/*",
  multiple = false,
  maxFiles = 10,
  value = [],
  onChange,
  disabled = false,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);

  const { mutateAsync: getPresignedUrls } = tanstackQueryClient.useMutation(
    "post",
    "/api/Content/file-objects/presigned-upload"
  );

  const { mutateAsync: confirmUpload } = tanstackQueryClient.useMutation(
    "post",
    "/api/Content/file-objects"
  );

  const processFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      if (!multiple && fileArray.length > 1) {
        toast.error("Only one file allowed");
        return;
      }
      if (multiple && value.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploadStates(fileArray.map((f) => ({ name: f.name, status: "uploading" })));

      try {
        const presignedUrls = await getPresignedUrls({
          body: {
            files: fileArray.map((f) => ({ category, ext: getExt(f), contentType: f.type })),
          },
        });

        await Promise.all(
          fileArray.map(async (file, i) => {
            const res = await fetch(presignedUrls[i].uploadUrl!, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type || "application/octet-stream" },
            });
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
            setUploadStates((prev) =>
              prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s))
            );
          })
        );

        const confirmed = await confirmUpload({
          body: {
            files: fileArray.map((f, i) => ({
              key: presignedUrls[i].key!,
              category,
              contentType: f.type,
              name: f.name,
              size: f.size,
            })),
          },
        });

        const publicUrls = confirmed.map((r) => r.publicUrl!);
        onChange?.(multiple ? [...value, ...publicUrls] : publicUrls);
      } catch {
        toast.error("Upload failed. Please try again.");
        setUploadStates((prev) => prev.map((s) => ({ ...s, status: "error" })));
      } finally {
        setTimeout(() => setUploadStates([]), 1500);
      }
    },
    [category, multiple, maxFiles, value, onChange, getPresignedUrls, confirmUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles]
  );

  const canAdd =
    !disabled && (multiple ? value.length < maxFiles : value.length === 0);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/20"
          )}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
        >
          <UploadCloudIcon
            className={cn(
              "size-9 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {accept === "image/*" ? "PNG, JPG, GIF, WebP" : accept}
              {multiple && maxFiles > 1 && ` · up to ${maxFiles} files`}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) {
                processFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>
      )}

      {/* Upload progress */}
      {uploadStates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {uploadStates.map((state, i) => (
            <div key={i} className="rounded-md border bg-muted/30 px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="max-w-50 truncate text-muted-foreground">
                  {state.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 font-medium",
                    state.status === "error"
                      ? "text-destructive"
                      : state.status === "done"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  )}
                >
                  {state.status === "error"
                    ? "Failed"
                    : state.status === "done"
                    ? "Done"
                    : "Uploading…"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Previews */}
      {value.length > 0 && (
        <div
          className={cn(
            "grid gap-2",
            multiple ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1 max-w-40"
          )}
        >
          {value.map((url, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.3";
                }}
              />
              {!disabled && (
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => onChange?.(value.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add more slot (multiple mode) */}
          {multiple && value.length < maxFiles && !disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
            >
              <UploadCloudIcon className="size-5" />
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    processFiles(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
