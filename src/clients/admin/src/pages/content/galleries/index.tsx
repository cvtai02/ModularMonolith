import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GalleryHorizontalIcon, PencilIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";
import type { GallerySummaryResponse } from "@shared/api/types/content";

// ─── Row ─────────────────────────────────────────────────────────────────────

function GalleryRow({ gallery }: { gallery: GallerySummaryResponse }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.contentGalleryEdit(gallery.id))}
      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
        <GalleryHorizontalIcon className="size-4 text-muted-foreground/40" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{gallery.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <code className="text-xs text-muted-foreground font-mono">{gallery.key}</code>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{gallery.itemCount} items</span>
        </div>
      </div>
      <Badge
        className={
          gallery.isPublic
            ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal"
            : "text-xs font-normal"
        }
        variant={gallery.isPublic ? "outline" : "secondary"}
      >
        {gallery.isPublic ? "Public" : "Private"}
      </Badge>
      <span className="shrink-0 text-xs text-muted-foreground">
        {new Date(gallery.lastModified).toLocaleDateString()}
      </span>
      <PencilIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminGalleriesPage() {
  const navigate = useNavigate();
  const contentClient = useContentClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-galleries", { search, page }],
    queryFn: () =>
      contentClient.listAdminGalleries({
        pageNumber: page,
        pageSize: 20,
        search: search || undefined,
        sortBy: "name",
        sortDirection: "asc",
      }),
  });

  const galleries = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GalleryHorizontalIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Galleries</h1>
          {!isLoading && data && (
            <Badge variant="secondary">{data.totalCount}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.contentGalleryNew)}>
          <PlusIcon data-icon="inline-start" />
          New gallery
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search galleries…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      {isError ? (
        <AdminErrorState
          title="Failed to load galleries"
          description="There was an error fetching galleries. Please try again."
        />
      ) : isLoading ? (
        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-10 rounded-md shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <GalleryHorizontalIcon className="size-10 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">No galleries found</p>
              <p className="text-xs text-muted-foreground">
                {search ? "Try adjusting your search." : "Create your first gallery to get started."}
              </p>
            </div>
            {!search && (
              <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.contentGalleryNew)}>
                <PlusIcon data-icon="inline-start" />
                New gallery
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          {galleries.map((gallery) => (
            <GalleryRow key={gallery.id} gallery={gallery} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <>
          <Separator />
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
