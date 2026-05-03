import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileTextIcon,
  FolderOpenIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { useContentClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";
import { cn } from "@/lib/utils";
import type { AdminBlogPostCollectionGroupResponse, BlogPostSummary } from "@shared/api/contracts/content";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type PostStatus = "Draft" | "Published" | "Archived";

function StatusBadge({ status }: { status: PostStatus }) {
  if (status === "Published")
    return (
      <Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Published
      </Badge>
    );
  if (status === "Draft")
    return <Badge variant="secondary" className="shrink-0 text-xs font-normal">Draft</Badge>;
  return <Badge variant="outline" className="shrink-0 text-xs font-normal">Archived</Badge>;
}

// ─── Post row ─────────────────────────────────────────────────────────────────

function PostRow({ post }: { post: BlogPostSummary }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.contentBlogEdit(post.id))}
      className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
    >
      <Avatar className="size-8 shrink-0 rounded-md">
        <AvatarImage src={post.imageUrl ?? undefined} alt={post.title} />
        <AvatarFallback className="rounded-md text-[10px] font-medium">
          {post.title.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{post.title}</p>
        {post.summary && (
          <p className="truncate text-xs text-muted-foreground">{post.summary}</p>
        )}
      </div>
      <StatusBadge status={post.status} />
      <span className="shrink-0 text-xs text-muted-foreground">
        {new Date(post.lastModified).toLocaleDateString()}
      </span>
      <PencilIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </button>
  );
}

// ─── Collection group ────────────────────────────────────────────────────────

function CollectionGroup({ group }: { group: AdminBlogPostCollectionGroupResponse }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Group header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left border-b"
      >
        <FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold">{group.title}</span>
          {!group.isUngrouped && (
            <code className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {group.key}
            </code>
          )}
        </div>
        {!group.isUngrouped && (
          <Badge
            className={cn(
              "shrink-0 text-xs font-normal",
              group.isPublic
                ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-muted text-muted-foreground"
            )}
          >
            {group.isPublic ? "Public" : "Private"}
          </Badge>
        )}
        <Badge variant="secondary" className="shrink-0 text-xs">
          {group.itemCount}
        </Badge>
        {!group.isUngrouped && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.contentBlogCollectionEdit(group.collectionId!));
            }}
          >
            Edit collection
          </Button>
        )}
      </button>

      {/* Posts */}
      {expanded && (
        <div>
          {group.items.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground italic">
              No posts in this group.
            </p>
          ) : (
            <div className="divide-y">
              {group.items.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "Draft" | "Published" | "Archived";
type VisibilityFilter = "all" | "public" | "private";

export default function AdminBlogsPage() {
  const navigate = useNavigate();
  const contentClient = useContentClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(1);

  const isPublicParam =
    visibilityFilter === "public" ? true : visibilityFilter === "private" ? false : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-blogs-by-collection", { search, status: statusFilter, isPublic: isPublicParam, page }],
    queryFn: () =>
      contentClient.listAdminBlogPostsByCollection({
        pageNumber: page,
        pageSize: 20,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        isPublic: isPublicParam,
        sortBy: "title",
        sortDirection: "asc",
      }),
  });

  const groups = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handleVisibilityChange(value: string) {
    setVisibilityFilter(value as VisibilityFilter);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Blog Posts</h1>
          {!isLoading && data && (
            <Badge variant="secondary">{data.totalCount}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.contentBlogNew)}>
          <PlusIcon data-icon="inline-start" />
          New post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts or collections…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={handleVisibilityChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups */}
      {isError ? (
        <AdminErrorState
          title="Failed to load blog posts"
          description="There was an error fetching blog posts. Please try again."
        />
      ) : isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto h-5 w-12 rounded-full" />
              </div>
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0">
                  <Skeleton className="size-8 rounded-md shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileTextIcon className="size-10 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium">No blog posts found</p>
              <p className="text-xs text-muted-foreground">
                {search || statusFilter !== "all" || visibilityFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Write your first blog post to get started."}
              </p>
            </div>
            {!search && statusFilter === "all" && visibilityFilter === "all" && (
              <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.contentBlogNew)}>
                <PlusIcon data-icon="inline-start" />
                New post
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <CollectionGroup
              key={group.collectionId ?? "ungrouped"}
              group={group}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <>
          <Separator />
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
