import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FolderOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
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
import { useProductCatalogClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { ROUTES } from "@/configs/routes";
import type { CollectionResponse } from "@shared/api/contracts/productcatalog";

export default function CollectionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productCatalogClient = useProductCatalogClient();

  const [deleteTarget, setDeleteTarget] = useState<CollectionResponse | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections"],
    queryFn: () => productCatalogClient.listCollection({ pageSize: 200 }),
  });

  const collections = data?.items ?? [];

  const { mutateAsync: deleteCollection } = useMutation({
    mutationFn: productCatalogClient.deleteCollection.bind(productCatalogClient),
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCollection(deleteTarget.id!);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
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
          <h1 className="text-xl font-semibold">Collections</h1>
          {!isLoading && collections.length > 0 && (
            <Badge variant="secondary">{data?.totalCount ?? collections.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => navigate(ROUTES.collectionNew)}>
          <PlusIcon data-icon="inline-start" />
          Add collection
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load collections"
              description="There was an error fetching collections. Please try again."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Products</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <FolderOpenIcon className="size-10 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium">No collections yet</p>
                        <p className="text-xs text-muted-foreground">
                          Group products into collections to make browsing easier.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.collectionNew)}>
                        <PlusIcon data-icon="inline-start" />
                        Add collection
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((col) => (
                  <TableRow
                    key={col.id}
                    className="cursor-pointer"
                    onClick={() => navigate(ROUTES.collectionEdit(col.id!))}
                  >
                    <TableCell className="font-medium">{col.title}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {col.slug}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {col.description || <span className="italic opacity-40">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {col.productCount ?? 0}
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
                          <DropdownMenuItem onClick={() => navigate(ROUTES.collectionEdit(col.id!))}>
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
              This will permanently remove the collection. Products in it will not be deleted.
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
