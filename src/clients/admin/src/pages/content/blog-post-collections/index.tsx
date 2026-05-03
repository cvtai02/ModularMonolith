import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FolderOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContentClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";
import type { BlogPostCollectionSummaryResponse } from "@shared/api/contracts/content";

const QUERY_KEY = "blog-post-collections";

export default function BlogPostCollectionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [deleteTarget, setDeleteTarget] = useState<BlogPostCollectionSummaryResponse | null>(null);

  const isPublicFilter =
    visibilityFilter === "public" ? true : visibilityFilter === "private" ? false : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY, { search, isPublic: isPublicFilter }],
    queryFn: () =>
      contentClient.listAdminBlogPostCollections({
        pageSize: 200,
        search: search || undefined,
        isPublic: isPublicFilter,
        sortBy: "lastModified",
        sortDirection: "desc",
      }),
  });

  const collections = (data?.items ?? []) as BlogPostCollectionSummaryResponse[];

  const { mutateAsync: deleteCollection } = useMutation({
    mutationFn: (id: number) => contentClient.deleteBlogPostCollection(id),
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCollection(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    } catch {
      toast.error("Failed to delete collection.");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpenIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Blog Post Collections</h1>
          {!isLoading && collections.length > 0 && (
            <Badge variant="secondary">{data?.totalCount ?? collections.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.contentBlogCollectionNew)}>
          <PlusIcon data-icon="inline-start" />
          Add collection
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search collections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={visibilityFilter}
          onValueChange={(v) => setVisibilityFilter(v as typeof visibilityFilter)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load collections"
              description="There was an error fetching blog post collections. Please try again."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="w-28">Visibility</TableHead>
                <TableHead className="w-20">Posts</TableHead>
                <TableHead className="w-40">Last modified</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <FolderOpenIcon className="size-10 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium">No collections found</p>
                        <p className="text-xs text-muted-foreground">
                          {search || visibilityFilter !== "all"
                            ? "Try adjusting your search or filter."
                            : "Create a collection to group blog posts together."}
                        </p>
                      </div>
                      {!search && visibilityFilter === "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(ROUTES.contentBlogCollectionNew)}
                        >
                          <PlusIcon data-icon="inline-start" />
                          Add collection
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((col) => (
                  <TableRow
                    key={col.id}
                    className="cursor-pointer"
                    onClick={() => navigate(ROUTES.contentBlogCollectionEdit(col.id))}
                  >
                    <TableCell className="font-medium">{col.title}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {col.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      {col.isPublic ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs font-normal">
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-normal">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {col.itemCount ?? 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {col.lastModified
                        ? new Date(col.lastModified).toLocaleDateString()
                        : <span className="italic opacity-40">—</span>}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground"
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(ROUTES.contentBlogCollectionEdit(col.id))}
                          >
                            <PencilIcon className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(col)}
                          >
                            <Trash2Icon className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!isLoading && collections.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {data?.totalCount ?? collections.length}{" "}
              {(data?.totalCount ?? collections.length) === 1 ? "collection" : "collections"}
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the collection. Blog posts in it will not be deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
