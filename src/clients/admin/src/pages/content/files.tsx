import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileIcon,
  FolderOpenIcon,
  ImageIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FileUploader, type FileCategory } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminErrorState } from "@/components/admin/admin-page";
import { API_BASE_URL, tanstackQueryClient } from "@/api/api-client";
import { appFetch } from "@/configs/appFetch";
import { cn } from "@/lib/utils";
import type { GetAllQuery, GetAllResponse } from "@shared/api/content-types";

type MediaFileListParams = GetAllQuery;
type MediaFilePaginatedList = GetAllResponse;
type MediaFileResponse = GetAllResponse["items"][number];

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["avatar", "review", "product", "content"] as const;
const PAGE_SIZE = 24;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isImage(contentType: string): boolean {
  return contentType.startsWith("image/");
}

async function fetchFiles(params: MediaFileListParams): Promise<MediaFilePaginatedList> {
  const url = new URL(`${API_BASE_URL}/api/Content/file-objects`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await appFetch(url);
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileCard({
  file,
  selected,
  onToggle,
}: {
  file: MediaFileResponse;
  selected: boolean;
  onToggle: (id: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = isImage(file.contentType) && !imgError;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-0 overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
    >
      <div
        className={cn(
          "absolute left-2 top-2 z-10 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(file.id)}
          className="bg-background/90 shadow-sm"
        />
      </div>

      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted/40">
        {showImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            {isImage(file.contentType)
              ? <ImageIcon className="size-10" />
              : <FileIcon className="size-10" />}
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {file.category}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-3 py-2.5">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          <span className="text-xs text-muted-foreground">{formatDate(file.created)}</span>
        </div>
        <p className="truncate text-[10px] text-muted-foreground/60">{file.contentType}</p>
      </div>
    </div>
  );
}

function FileSkeleton() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  const [category, setCategory] = useState<FileCategory>("product");
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (open) setUrls([]);
  }, [open]);

  const handleChange = (newUrls: string[]) => {
    setUrls(newUrls);
    onUploaded();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as FileCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <FileUploader
            category={category}
            multiple
            maxFiles={20}
            value={urls}
            onChange={handleChange}
          />
        </FieldGroup>
        <DialogFooter showCloseButton>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentFilesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const params: MediaFileListParams = {
    PageNumber: page,
    PageSize: PAGE_SIZE,
    Search: search || undefined,
    Category: category !== "all" ? category : undefined,
    SortBy: "created",
    SortDirection: "desc",
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["content-files", params],
    queryFn: () => fetchFiles(params),
    staleTime: 30_000,
  });

  const { mutateAsync: deleteFiles, isPending: isDeleting } =
    tanstackQueryClient.useMutation("delete", "/api/Content/file-objects");

  const files = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function handleToggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    try {
      await deleteFiles({ body: { ids: Array.from(selectedIds) } });
      toast.success(`${selectedIds.size} file${selectedIds.size > 1 ? "s" : ""} deleted`);
      setSelectedIds(new Set());
      setDeleteConfirmOpen(false);
      refetch();
    } catch {
      toast.error("Failed to delete files. Please try again.");
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderOpenIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Media Files</h1>
          {totalCount > 0 && (
            <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadOpen(true)}
          >
            <UploadCloudIcon data-icon="inline-start" />
            Upload
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCwIcon className={isFetching ? "animate-spin" : ""} data-icon />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={(v) => handleCategory(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isError ? (
        <AdminErrorState
          title="Failed to load files"
          description="There was an error fetching media files. Please try again."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <FileSkeleton key={i} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <FolderOpenIcon className="size-12 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium">No files found</p>
            <p className="text-xs text-muted-foreground">
              {search || category !== "all"
                ? "Try adjusting your search or filters."
                : "Upload files to see them here."}
            </p>
          </div>
          {(search || category !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setCategory("all"); }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              selected={selectedIds.has(file.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {totalCount.toLocaleString()} files
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Upload dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => refetch()}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} file{selectedIds.size > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected files will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
