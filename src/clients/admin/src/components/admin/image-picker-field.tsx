import { useState } from "react";
import { PlusIcon, VideoIcon, XIcon } from "lucide-react";

import { MediaPickerModal } from "@/pages/products/components/MediaPickerModal";
import { isMp4 } from "@/pages/products/components/helpers";
import { resolveMediaUrl, urlToMediaKey } from "@/lib/media";

export function ImagePickerField({
  value,
  onChange,
  category = "product",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  category?: "product" | "content" | "avatar" | "review";
}) {
  const [open, setOpen] = useState(false);

  const removeImage = (url: string) => {
    onChange(value.filter((x) => x !== url));
  };

  const handleSelect = (urls: string[]) => {
    // Merge newly selected URLs into the existing list (preserve order, deduplicate)
    const next = [...value];
    for (const url of urls) {
      if (!next.includes(url)) next.push(url);
    }
    onChange(next);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="group relative size-40 shrink-0 overflow-hidden rounded-xl border bg-muted"
          >
            {isMp4(url) ? (
              <div
                className="flex size-full cursor-pointer flex-col items-center justify-center gap-1 bg-muted text-muted-foreground"
                onClick={() => setOpen(true)}
              >
                <VideoIcon className="size-8 opacity-60" />
                <span className="text-[10px] truncate max-w-[90%] px-1">Video</span>
              </div>
            ) : (
              <img
                src={url}
                alt="Product"
                className="size-full cursor-pointer object-cover"
                onClick={() => setOpen(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.3";
                }}
              />
            )}
            <button
              type="button"
              aria-label="Remove media"
              onClick={() => removeImage(url)}
              className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-40 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
        >
          <PlusIcon className="size-9 opacity-50" />
          <span className="text-xs">Add media</span>
        </button>
      </div>

      <MediaPickerModal
        open={open}
        onOpenChange={setOpen}
        selectedUrls={[]}
        onSelect={handleSelect}
        multiple
        category={category}
      />
    </>
  );
}

export function SingleImagePickerField({
  value,
  onChange,
  category = "product",
}: {
  value: string;
  onChange: (key: string) => void;
  category?: "product" | "content" | "avatar" | "review";
}) {
  const [open, setOpen] = useState(false);
  const displayUrl = resolveMediaUrl(value);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {value ? (
          <div className="group relative size-40 shrink-0 overflow-hidden rounded-xl border bg-muted">
            <img
              src={displayUrl}
              alt="Post image"
              className="size-full cursor-pointer object-cover"
              onClick={() => setOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0.3";
              }}
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange("")}
              className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-40 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
        >
          <PlusIcon className="size-9 opacity-50" />
          <span className="text-xs">{value ? "Change image" : "Add image"}</span>
        </button>
      </div>

      <MediaPickerModal
        open={open}
        onOpenChange={setOpen}
        selectedUrls={displayUrl ? [displayUrl] : []}
        onSelect={(urls) => onChange(urlToMediaKey(urls[0] ?? ""))}
        category={category}
      />
    </>
  );
}
