import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileIcon,
  FolderOpenIcon,
  ImageIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { API_BASE_URL } from "@/api/api-client";
import { appFetch } from "@/configs/appFetch";
import type { MediaFileListParams, MediaFilePaginatedList, MediaFileResponse } from "@shared/api/missing-api";

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

function FileCard({ file }: { file: MediaFileResponse }) {
  const [imgError, setImgError] = useState(false);
  const showImage = isImage(file.contentType) && !imgError;

  return (
    <div className="group flex flex-col gap-0 overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentFilesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpenIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Media Files</h1>
          {totalCount > 0 && (
            <Badge variant="secondary">{totalCount.toLocaleString()}</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
            <FileCard key={file.id} file={file} />
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
    </div>
  );
}
