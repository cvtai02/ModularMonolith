import { useState, useEffect } from "react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  SearchIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentClient } from "@/components/containers/api-client-provider";
import { cn } from "@/lib/utils";
import type { BlogPostSummary } from "@shared/api/contracts/content";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alreadyPickedIds?: Set<number>;
  /** Limit selectable posts to Published only (for public collections). */
  publishedOnly?: boolean;
  onConfirm: (posts: BlogPostSummary[]) => void;
}

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "Published")
    return (
      <Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
        Published
      </Badge>
    );
  if (status === "Draft")
    return <Badge variant="secondary" className="shrink-0 text-xs font-normal">Draft</Badge>;
  if (status === "Archived")
    return <Badge variant="outline" className="shrink-0 text-xs font-normal">Archived</Badge>;
  return null;
}

const PAGE_SIZE = 12;

export function BlogPostPickerModal({
  open,
  onOpenChange,
  alreadyPickedIds = new Set(),
  publishedOnly = false,
  onConfirm,
}: Props) {
  const contentClient = useContentClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<number, BlogPostSummary>>(new Map());

  useEffect(() => {
    if (open) {
      setSearch("");
      setPage(1);
      setSelected(new Map());
    }
  }, [open]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["blog-posts-picker", { search, page, publishedOnly }],
    queryFn: () =>
      contentClient.listAdminBlogPosts({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: publishedOnly ? "Published" : undefined,
        sortBy: "title",
        sortDirection: "asc",
      }),
    enabled: open,
  });

  const posts = (data?.items ?? []) as BlogPostSummary[];
  const totalPages = data?.totalPages ?? 1;

  function toggle(post: BlogPostSummary) {
    const id = post.id;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, post);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selected.values()));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[78vh] w-[600px] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3">
          <DialogTitle>Select blog posts</DialogTitle>
          {publishedOnly && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Only published posts can be added to a public collection.
            </p>
          )}
        </DialogHeader>

        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Skeleton className="size-4 shrink-0 rounded" />
                  <Skeleton className="size-9 shrink-0 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <FileTextIcon className="size-10 opacity-30" />
              <p className="text-sm">
                {search ? "No posts match your search." : "No blog posts found."}
              </p>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-0.5", isFetching && "opacity-60")}>
              {posts.map((post) => {
                const id = post.id;
                const isAlreadyPicked = alreadyPickedIds.has(id);
                const isSelected = selected.has(id);
                const isUnselectable = publishedOnly && post.status !== "Published";

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={isAlreadyPicked || isUnselectable}
                    onClick={() => toggle(post)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                      isAlreadyPicked || isUnselectable
                        ? "cursor-not-allowed opacity-40"
                        : isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isAlreadyPicked || isUnselectable
                          ? "border-muted-foreground/30 bg-muted"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/50"
                      )}
                    >
                      {(isSelected || isAlreadyPicked) && <CheckIcon className="size-3" />}
                    </div>

                    <Avatar className="size-9 shrink-0 rounded-md">
                      <AvatarImage src={post.imageUrl ?? undefined} alt={post.title} />
                      <AvatarFallback className="rounded-md text-[10px] font-medium">
                        {post.title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{post.title}</p>
                      {post.slug && (
                        <p className="truncate text-xs text-muted-foreground font-mono">{post.slug}</p>
                      )}
                    </div>

                    <StatusBadge status={post.status} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-center gap-2 border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}

        <DialogFooter showCloseButton className="shrink-0 border-t px-4 py-3">
          {selected.size > 0 && (
            <span className="mr-auto text-sm text-muted-foreground">
              {selected.size} post{selected.size > 1 ? "s" : ""} selected
            </span>
          )}
          <Button disabled={selected.size === 0} onClick={handleConfirm}>
            Add{selected.size > 0 ? ` ${selected.size}` : ""} post
            {selected.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
