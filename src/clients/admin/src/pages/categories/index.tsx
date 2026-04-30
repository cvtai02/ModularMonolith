import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  SearchIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { CategoryResponse } from "@shared/api/api-types";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormValues = {
  name: string;
  slug: string;
  description: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 100);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);

  const { data, isLoading, isError, refetch } = tanstackQueryClient.useQuery(
    "get",
    "/api/ProductCatalog/categories",
    { params: { query: { pageSize: 200, search: search.trim() || undefined } } }
  );

  const categories = data?.items ?? [];

  const { mutateAsync: createCategory, isPending: isCreating } =
    tanstackQueryClient.useMutation("post", "/api/ProductCatalog/categories");

  const { mutateAsync: updateCategory, isPending: isUpdating } =
    tanstackQueryClient.useMutation("put", "/api/ProductCatalog/categories/{name}");

  const { mutateAsync: deleteCategory } =
    tanstackQueryClient.useMutation("delete", "/api/ProductCatalog/categories/{name}");

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: "", slug: "", description: "" } });

  function openAdd() {
    setEditing(null);
    reset({ name: "", slug: "", description: "" });
    setSheetOpen(true);
  }

  function openEdit(cat: CategoryResponse) {
    setEditing(cat);
    reset({ name: cat.name ?? "", slug: cat.slug ?? "", description: cat.description ?? "" });
    setSheetOpen(true);
  }

  function onNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing) setValue("slug", slugify(e.target.value));
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateCategory({
          params: { path: { name: editing.name! } },
          body: {
            description: values.description,
            slug: values.slug,
            status: editing.status,
            parentName: editing.parentName,
            imageKey: null,
          },
        });
        toast.success("Category updated");
      } else {
        await createCategory({
          body: {
            name: values.name,
            slug: values.slug || undefined,
            description: values.description,
          },
        });
        toast.success("Category created");
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
      await deleteCategory({ params: { path: { name: deleteTarget.name! } } });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete category.");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Categories</h1>
          {!isLoading && categories.length > 0 && (
            <Badge variant="secondary">{data?.totalCount ?? categories.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon data-icon="inline-start" />
          Add category
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {isError ? (
          <div className="p-6">
            <AdminErrorState title="Failed to load categories" description="There was an error fetching categories. Please try again." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parent</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <FolderIcon className="size-10 text-muted-foreground/40" />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">
                          {search ? "No categories match your search" : "No categories yet"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {search ? "Try a different keyword." : "Create your first category to organise products."}
                        </p>
                      </div>
                      {!search && (
                        <Button variant="outline" size="sm" onClick={openAdd}>
                          <PlusIcon data-icon="inline-start" />
                          Add category
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.name} className="cursor-pointer" onClick={() => openEdit(cat)}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{cat.slug}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {cat.description || <span className="italic opacity-50">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cat.parentName ?? <span className="italic opacity-50">—</span>}
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
                          <DropdownMenuItem onClick={() => openEdit(cat)}>
                            <PencilIcon className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(cat)}
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

        {!isLoading && categories.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {data?.totalCount ?? categories.length} {(data?.totalCount ?? categories.length) === 1 ? "category" : "categories"}
              {search && ` matching "${search}"`}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>{editing ? "Edit category" : "Add category"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-5">
              <FieldGroup>
                {editing ? (
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input value={editing.name ?? ""} disabled className="opacity-60" />
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel>Name *</FieldLabel>
                    <Input
                      {...register("name", { required: "Name is required" })}
                      placeholder="e.g. Beverages"
                      onChange={(e) => { register("name").onChange(e); onNameChange(e); }}
                    />
                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                  </Field>
                )}

                <Field>
                  <FieldLabel>Slug</FieldLabel>
                  <Input
                    {...register("slug")}
                    placeholder="beverages"
                    className="font-mono text-sm"
                  />
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...register("description")} placeholder="Briefly describe this category…" rows={3} />
                </Field>
              </FieldGroup>
            </div>

            <SheetFooter className="border-t px-6 py-4">
              <Button variant="outline" type="button" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {editing ? "Save changes" : "Create category"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the category. Products assigned to it will become uncategorised. This action cannot be undone.
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
