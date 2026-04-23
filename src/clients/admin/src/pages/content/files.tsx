import { useCallback, useRef, useState } from "react";
import {
  CopyIcon,
  FileIcon,
  FilesIcon,
  FilterIcon,
  ImageIcon,
  Trash2Icon,
  UploadCloudIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { tanstackQueryClient } from "@/api/api-client";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaFile {
  id: string;
  name: string;
  ext: string;
  publicUrl: string;
  uploadedAt: string;
}

type FileFilter = "all" | "image" | "video" | "document";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".avi"];

function fileFilter(f: MediaFile): FileFilter {
  if (IMAGE_EXTS.includes(f.ext)) return "image";
  if (VIDEO_EXTS.includes(f.ext)) return "video";
  return "document";
}

function FileTypeIcon({ ext, className }: { ext: string; className?: string }) {
  if (IMAGE_EXTS.includes(ext))
    return <ImageIcon className={className} />;
  if (VIDEO_EXTS.includes(ext))
    return <VideoIcon className={className} />;
  return <FileIcon className={className} />;
}

let uid = 0;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentFilesPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<FileFilter>("all");

  const { mutateAsync: getPresignedUpload } = tanstackQueryClient.useMutation(
    "post",
    "/api/Content/file-objects/presigned-upload"
  );

  const upload = useCallback(async (fileList: FileList) => {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        arr.map(async (file) => {
          const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase() || ".bin";
          const data = await getPresignedUpload({
            body: { category: "content", ext, contentType: file.type },
          });
          if (!data?.uploadUrl) throw new Error("Presign failed");
          const res = await fetch(data.uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "application/octet-stream" },
          });
          if (!res.ok) throw new Error("Upload failed");
          return { ext, publicUrl: data.publicUrl!, name: file.name };
        })
      );
      setFiles((prev) => [
        ...results.map((r) => ({
          id: String(++uid),
          name: r.name,
          ext: r.ext,
          publicUrl: r.publicUrl,
          uploadedAt: new Date().toISOString(),
        })),
        ...prev,
      ]);
      toast.success(`${results.length} file${results.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [getPresignedUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
    },
    [upload]
  );

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  }

  function remove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const displayed =
    filter === "all" ? files : files.filter((f) => fileFilter(f) === filter);

  const counts = {
    all: files.length,
    image: files.filter((f) => fileFilter(f) === "image").length,
    video: files.filter((f) => fileFilter(f) === "video").length,
    document: files.filter((f) => fileFilter(f) === "document").length,
  };

  const filterTabs: { key: FileFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "video", label: "Videos" },
    { key: "document", label: "Documents" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilesIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Files</h1>
          {files.length > 0 && (
            <Badge variant="secondary">{files.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <UploadCloudIcon data-icon="inline-start" />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) {
              upload(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-muted-foreground/35 hover:bg-muted/20"
        )}
      >
        <UploadCloudIcon
          className={cn(
            "size-10 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground/50"
          )}
        />
        <div>
          <p className="text-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Images, videos, documents — any file type
          </p>
        </div>
      </div>

      {/* Filter tabs + grid */}
      {files.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1 self-start rounded-lg border bg-muted/40 p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  filter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <span className="tabular-nums text-[10px]">{counts[tab.key]}</span>
              </button>
            ))}
          </div>

          {displayed.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No {filter} files uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {displayed.map((file) => {
                const isImage = fileFilter(file) === "image";
                return (
                  <div
                    key={file.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {isImage ? (
                        <img
                          src={file.publicUrl}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileTypeIcon
                            ext={file.ext}
                            className="size-10 text-muted-foreground/40"
                          />
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyUrl(file.publicUrl); }}
                          className="flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background"
                        >
                          <CopyIcon className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); remove(file.id); }}
                          className="flex size-8 items-center justify-center rounded-full bg-background/90 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2Icon className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="px-2 py-1.5">
                      <p className="truncate text-xs font-medium">{file.name}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {file.ext.replace(".", "")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {files.length === 0 && !uploading && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <FilterIcon className="size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No files yet. Upload your first file above.
          </p>
        </div>
      )}
    </div>
  );
}
