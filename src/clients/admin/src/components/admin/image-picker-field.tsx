import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { MediaPickerModal } from "@/pages/products/components/MediaPickerModal";
import { resolveMediaUrl, urlToMediaKey } from "@/lib/media";

export function ImagePickerField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const removeImage = (url: string) => {
    onChange(value.filter((x) => x !== url));
  };

  const addImage = (url: string) => {
    if (!url || value.includes(url)) return;
    onChange([...value, url]);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="group relative size-40 shrink-0 overflow-hidden rounded-xl border bg-muted"
          >
            <img
              src={url}
              alt="Product"
              className="size-full cursor-pointer object-cover"
              onClick={() => setOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0.3";
              }}
            />
            <button
              type="button"
              aria-label="Remove image"
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
          <span className="text-xs">Add image</span>
        </button>
      </div>

      <MediaPickerModal
        open={open}
        onOpenChange={setOpen}
        selectedUrl={value[0] ?? ""}
        onSelect={addImage}
      />
    </>
  );
}

export function SingleImagePickerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
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
        selectedUrl={displayUrl}
        onSelect={(url) => onChange(urlToMediaKey(url))}
      />
    </>
  );
}
