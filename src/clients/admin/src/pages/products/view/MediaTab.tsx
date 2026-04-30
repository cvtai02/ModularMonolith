import { ImageIcon } from "lucide-react";
import type { ProductResponse } from "@shared/api/productcatalog-types";

type Media = ProductResponse["medias"][number];

export function MediaTab({ product }: { product: ProductResponse }) {
  const medias = [...(product.medias ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  if (medias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center gap-3">
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No media uploaded.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {medias.map((media) => (
        <MediaCard key={media.id} media={media} />
      ))}
    </div>
  );
}

function MediaCard({ media }: { media: Media }) {
  const isImage = !media.type || media.type.startsWith("image");

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {isImage ? (
        <img
          src={media.url}
          alt=""
          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <ImageIcon className="size-8 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-[10px] text-white">{media.type ?? "file"}</p>
      </div>
    </div>
  );
}
