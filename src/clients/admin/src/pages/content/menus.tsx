import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  MenuIcon,
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { MenuResponse } from "@shared/api/missing-api";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormValues = {
  name: string;
  url: string;
  description: string;
  parentName: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentMenusPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<MenuResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuResponse | null>(null);

  const { data: rawData, isLoading, isError, refetch } = tanstackQueryClient.useQuery(
    "get",
    "/api/Content/Menu"
  );
  const menus = (rawData as unknown as MenuResponse[]) ?? [];

  const { mutateAsync: createMenu, isPending: isCreating } =
    tanstackQueryClient.useMutation("post", "/api/Content/Menu");

  const { mutateAsync: updateMenu, isPending: isUpdating } =
    tanstackQueryClient.useMutation("put", "/api/Content/Menu/{name}");

  const { mutateAsync: deleteMenu, isPending: isDeleting } =
    tanstackQueryClient.useMutation("delete", "/api/Content/Menu/{name}");

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", url: "", description: "", parentName: "" },
  });

  function openAdd() {
    setEditing(null);
    reset({ name: "", url: "", description: "", parentName: "" });
    setSheetOpen(true);
  }

  function openEdit(menu: MenuResponse) {
    setEditing(menu);
    reset({
      name: menu.name,
      url: menu.url,
      description: menu.description ?? "",
      parentName: menu.parentName ?? "",
    });
    setSheetOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateMenu({
          params: { path: { name: editing.name } },
          body: {
            url: values.url,
            description: values.description || undefined,
            parentName: values.parentName || null,
          },
        });
        toast.success("Menu updated");
      } else {
        await createMenu({
          body: {
            name: values.name,
            url: values.url,
            description: values.description || undefined,
            parentName: values.parentName || null,
          },
        });
        toast.success("Menu created");
      }
      setSheetOpen(false);
      refetch();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMenu({ params: { path: { name: deleteTarget.name } } });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete menu.");
    }
  }

  const roots = menus.filter((m) => !m.parentName);
  const children = (parent: string) =>
    menus.filter((m) => m.parentName === parent);

  function MenuRow({ menu, indent }: { menu: MenuResponse; indent?: boolean }) {
    const subs = children(menu.name);
    return (
      <>
        <TableRow
          className="cursor-pointer"
          onClick={() => openEdit(menu)}
        >
          <TableCell>
            {indent && (
              <span className="mr-1 text-muted-foreground/40">└</span>
            )}
            <span className="font-medium">{menu.name}</span>
          </TableCell>
          <TableCell className="text-sm text-muted-foreground">
            {menu.url}
          </TableCell>
          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
            {menu.description ?? <span className="italic opacity-40">—</span>}
          </TableCell>
          <TableCell>
            {subs.length > 0 && (
              <Badge variant="secondary">{subs.length} children</Badge>
            )}
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
                <DropdownMenuItem onClick={() => openEdit(menu)}>
                  <PencilIcon className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteTarget(menu)}
                >
                  <Trash2Icon className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {subs.map((sub) => (
          <MenuRow key={sub.name} menu={sub} indent />
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MenuIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Menus</h1>
          {menus.length > 0 && (
            <Badge variant="secondary">{menus.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={openAdd}>
          <PlusIcon data-icon="inline-start" />
          Add menu
        </Button>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {isError ? (
          <div className="p-6">
            <AdminErrorState
              title="Failed to load menus"
              description="There was an error fetching menus. Please try again."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Children</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : menus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <MenuIcon className="size-10 text-muted-foreground/30" />
                      <div>
                        <p className="text-sm font-medium">No menus yet</p>
                        <p className="text-xs text-muted-foreground">
                          Create your first menu to start building navigation.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={openAdd}>
                        <PlusIcon data-icon="inline-start" />
                        Add menu
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roots.map((menu) => (
                  <MenuRow key={menu.name} menu={menu} />
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!isLoading && menus.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {menus.length} {menus.length === 1 ? "menu" : "menus"}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>{editing ? "Edit menu" : "Add menu"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-5">
              <FieldGroup>
                <Field>
                  <FieldLabel>Name *</FieldLabel>
                  <Input
                    {...register("name", { required: "Name is required" })}
                    placeholder="e.g. main-nav"
                    disabled={!!editing}
                  />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>URL *</FieldLabel>
                  <Input
                    {...register("url", { required: "URL is required" })}
                    placeholder="/about"
                  />
                  {errors.url && <FieldError>{errors.url.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    {...register("description")}
                    placeholder="Optional description…"
                    rows={2}
                  />
                </Field>

                <Field>
                  <FieldLabel>Parent menu</FieldLabel>
                  <Input
                    {...register("parentName")}
                    placeholder="Leave blank for top-level"
                    list="parent-options"
                  />
                  <datalist id="parent-options">
                    {menus
                      .filter((m) => !editing || m.name !== editing.name)
                      .map((m) => (
                        <option key={m.name} value={m.name} />
                      ))}
                  </datalist>
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter className="border-t px-6 py-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving…"
                  : editing
                  ? "Save changes"
                  : "Create menu"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the menu and all its children. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
