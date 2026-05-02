import { useCallback, useState } from "react";
import { CheckIcon, FileIcon, ImageIcon, SearchIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentClient } from "@/components/containers/api-client-provider";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 18;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUrl: string;
  onSelect: (url: string) => void;
};

export function MediaPickerModal({ open, onOpenChange, selectedUrl, onSelect }: Props) {
  const queryClient = useQueryClient();
  const contentClient = useContentClient();
  const [prevOpen, setPrevOpen] = useState(open);
  const [pendingUrl, setPendingUrl] = useState(selectedUrl);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setPendingUrl(selectedUrl);
      setSearch("");
      setPage(1);
    }
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["content-files", { page, search }],
    queryFn: () => contentClient.listMediaFiles({
      PageNumber: page,
      PageSize: PAGE_SIZE,
      Search: search || undefined,
      Category: "product",
      SortBy: "created",
      SortDirection: "desc",
    }),
    enabled: open,
  });

  const files = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleUpload = useCallback(
    (urls: string[]) => {
      queryClient.invalidateQueries({ queryKey: ["content-files"] });
      setSearch("");
      setPage(1);
      if (urls.length > 0) setPendingUrl(urls[0]);
    },
    [queryClient]
  );

  const handleConfirm = () => {
    onSelect(pendingUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[80vh] w-[80vw] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3">
          <DialogTitle>Select image</DialogTitle>
        </DialogHeader>

        {/* Upload zone */}
        <div className="shrink-0 px-4 pb-3">
          <FileUploader
            category="product"
            accept="image/*"
            multiple
            value={[]}
            onChange={handleUpload}
            className="[&_.cn-file-uploader-drop]:py-4"
          />
        </div>

        <Separator />

        {/* Search */}
        <div className="shrink-0 px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" data-icon />
            <Input
              placeholder="Search images…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <ImageIcon className="size-10 opacity-30" />
              <p className="text-sm">{search ? "No images match your search." : "No images uploaded yet."}</p>
            </div>
          ) : (
            <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", isFetching && "opacity-60")}>
              {files.map((file) => {
                const isImg = file.contentType?.startsWith("image/");
                const isSelected = file.url === pendingUrl;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setPendingUrl(isSelected ? "" : file.url!)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-colors",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    {isImg ? (
                      <img
                        src={file.url!}
                        alt={file.name!}
                        className="size-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <FileIcon className="size-7 text-muted-foreground/40" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                          <CheckIcon className="size-3.5" />
                        </div>
                      </div>
                    )}
                    <p className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {file.name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-center gap-2 border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
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
            </Button>
          </div>
        )}

        <DialogFooter showCloseButton className="shrink-0">
          <Button disabled={!pendingUrl} onClick={handleConfirm}>
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
