import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FolderOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { tanstackQueryClient } from "@/api/api-client";
import { AdminErrorState } from "@/components/admin/admin-page";
import { applyValidationErrors } from "@/lib/form-error";
import type { CollectionResponse } from "@shared/api/api-types";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormValues = {
  title: string;
  slug: string;
  description: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 100);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CollectionResponse | null>(null);

  const { data, isLoading, isError, refetch } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/collections",
    { params: { query: { pageSize: 200 } } }
  );

  const collections = data?.items ?? [];

  const { mutateAsync: createCollection, isPending: isCreating } =
    tanstackQueryClient.useMutation("post", "/api/ProductCatalog/collections");

  const { mutateAsync: updateCollection, isPending: isUpdating } =
    tanstackQueryClient.useMutation("put", "/api/ProductCatalog/collections/{id}");

  const { mutateAsync: deleteCollection } =
    tanstackQueryClient.useMutation("delete", "/api/ProductCatalog/collections/{id}");

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { title: "", slug: "", description: "" } });

  function openAdd() {
    setEditing(null);
    reset({ title: "", slug: "", description: "" });
    setSheetOpen(true);
  }

  function openEdit(col: CollectionResponse) {
    setEditing(col);
    reset({ title: col.title ?? "", slug: col.slug ?? "", description: col.description ?? "" });
    setSheetOpen(true);
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing) setValue("slug", slugify(e.target.value));
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateCollection({
          params: { path: { id: editing.id! } },
          body: {
            description: values.description,
            slug: values.slug,
            imageKey: null,
          },
        });
        toast.success("Collection updated");
      } else {
        await createCollection({
          body: {
            title: values.title,
            slug: values.slug || undefined,
            description: values.description,
          },
        });
        toast.success("Collection created");
      }
      setSheetOpen(false);
      refetch();
    } catch (err) {
      if (!applyValidationErrors(err, setError)) throw err;
    }
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCollection({ params: { path: { id: deleteTarget.id! } } });
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      refetch();
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
        <Button size="sm" onClick={openAdd}>
          <PlusIcon data-icon="inline-start" />
          Add collection
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {isError ? (
          <div className="p-6">
            <AdminErrorState title="Failed to load collections" description="There was an error fetching collections. Please try again." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
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
                    <TableCell />
                  </TableRow>
                ))
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <FolderOpenIcon className="size-10 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium">No collections yet</p>
                        <p className="text-xs text-muted-foreground">
                          Group products into collections to make browsing easier.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={openAdd}>
                        <PlusIcon data-icon="inline-start" />
                        Add collection
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((col) => (
                  <TableRow key={col.id} className="cursor-pointer" onClick={() => openEdit(col)}>
                    <TableCell className="font-medium">{col.title}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{col.slug}</code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {col.description || <span className="italic opacity-40">—</span>}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(col)}>
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

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>{editing ? "Edit collection" : "Add collection"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-5">
              <FieldGroup>
                {editing ? (
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input value={editing.title ?? ""} disabled className="opacity-60" />
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel>Title *</FieldLabel>
                    <Input
                      {...register("title", { required: "Title is required" })}
                      placeholder="e.g. Summer Sale"
                      onChange={(e) => { register("title").onChange(e); onTitleChange(e); }}
                    />
                    {errors.title && <FieldError>{errors.title.message}</FieldError>}
                  </Field>
                )}

                <Field>
                  <FieldLabel>Slug</FieldLabel>
                  <Input {...register("slug")} placeholder="summer-sale" className="font-mono text-sm" />
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...register("description")} placeholder="Briefly describe this collection…" rows={3} />
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter className="border-t px-6 py-4">
              <Button variant="outline" type="button" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {editing ? "Save changes" : "Create collection"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the collection. Products in it will not be deleted. This action cannot be undone.
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
