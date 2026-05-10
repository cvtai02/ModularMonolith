import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronRightIcon, LinkIcon, SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media";
import {
  useContentClient,
  useProductCatalogClient,
} from "@/components/containers/api-client-provider";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InternalLinkType =
  | "Product"
  | "Collection"
  | "Category"
  | "BlogPost"
  | "BlogCollection"
  | "Custom";

export type InternalLinkValue = {
  type: InternalLinkType;
  refId: string;
  label: string;
  href: string;
  imageKey?: string | null;
};

const LINK_TYPES: { value: InternalLinkType; label: string }[] = [
  { value: "Product", label: "Product" },
  { value: "Collection", label: "Collection" },
  { value: "Category", label: "Category" },
  { value: "BlogPost", label: "Blog post" },
  { value: "BlogCollection", label: "Blog collection" },
  { value: "Custom", label: "Custom URL" },
];

// ─── Result item ──────────────────────────────────────────────────────────────

function ResultItem({
  label,
  href,
  imageKey,
  selected,
  onClick,
}: {
  label: string;
  href: string;
  imageKey?: string | null;
  selected: boolean;
  onClick: () => void;
}) {
  const imageUrl = imageKey ? resolveMediaUrl(imageKey) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
        selected ? "bg-accent" : "hover:bg-muted/60"
      )}
    >
      <div className="size-6 shrink-0 overflow-hidden rounded border bg-muted flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <LinkIcon className="size-3 text-muted-foreground/40" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate">{label}</p>
        <p className="truncate text-[10px] text-muted-foreground font-mono">{href}</p>
      </div>
      {selected && <CheckIcon className="size-3 shrink-0 text-foreground" />}
    </button>
  );
}

// ─── Type-specific list loader ────────────────────────────────────────────────

function useTypedResults(type: InternalLinkType, search: string, enabled: boolean) {
  const productClient = useProductCatalogClient();
  const contentClient = useContentClient();

  const productQuery = useQuery({
    queryKey: ["internal-link-products", search],
    queryFn: () => productClient.listProduct({ PageNumber: 1, PageSize: 20, Search: search || undefined }),
    enabled: enabled && type === "Product",
  });
  const collectionQuery = useQuery({
    queryKey: ["internal-link-collections", search],
    queryFn: () => productClient.listCollection({ pageNumber: 1, pageSize: 20, search: search || undefined }),
    enabled: enabled && type === "Collection",
  });
  const categoryQuery = useQuery({
    queryKey: ["internal-link-categories", search],
    queryFn: () => productClient.listCategory({ pageNumber: 1, pageSize: 20, search: search || undefined }),
    enabled: enabled && type === "Category",
  });
  const blogPostQuery = useQuery({
    queryKey: ["internal-link-blog-posts", search],
    queryFn: () => contentClient.listAdminBlogPosts({ pageNumber: 1, pageSize: 20, search: search || undefined }),
    enabled: enabled && type === "BlogPost",
  });
  const blogCollectionQuery = useQuery({
    queryKey: ["internal-link-blog-collections", search],
    queryFn: () => contentClient.listAdminBlogPostCollections({ pageNumber: 1, pageSize: 20, search: search || undefined }),
    enabled: enabled && type === "BlogCollection",
  });

  if (type === "Product") return { isLoading: productQuery.isLoading, items: (productQuery.data?.items ?? []).map((p) => ({ refId: p.id, label: p.name, href: `/products/${p.slug}`, imageKey: p.imageUrl ?? null })) };
  if (type === "Collection") return { isLoading: collectionQuery.isLoading, items: (collectionQuery.data?.items ?? []).map((c) => ({ refId: String(c.id), label: c.title, href: `/collections/${c.slug}`, imageKey: c.imageUrl ?? null })) };
  if (type === "Category") return { isLoading: categoryQuery.isLoading, items: (categoryQuery.data?.items ?? []).map((c) => ({ refId: c.name, label: c.name, href: `/categories/${c.slug}`, imageKey: c.imageUrl ?? null })) };
  if (type === "BlogPost") return { isLoading: blogPostQuery.isLoading, items: (blogPostQuery.data?.items ?? []).map((p) => ({ refId: String(p.id), label: p.title, href: `/blog/${p.slug}`, imageKey: p.imageKey ?? null })) };
  return { isLoading: blogCollectionQuery.isLoading, items: (blogCollectionQuery.data?.items ?? []).map((c) => ({ refId: c.key, label: c.title, href: `/blog/collections/${c.key}`, imageKey: null })) };
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InternalLinkInputProps {
  value: string;
  onChange: (href: string) => void;
  className?: string;
  /** Apply frosted-glass styling to inputs (for use over images). */
  glassy?: boolean;
}

const GLASS = "backdrop-blur-md bg-black/30 border-white/20 text-white placeholder:text-white/50 focus-visible:border-white/50";

export function InternalLinkInput({ value, onChange, className, glassy }: InternalLinkInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [activeType, setActiveType] = useState<InternalLinkType | null>(null);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  // Flip upward if there isn't enough space below the trigger
  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 320);
    }
  }, [open]);

  const { isLoading, items } = useTypedResults(
    activeType ?? "Product",
    search,
    open && activeType !== null && activeType !== "Custom"
  );

  function handleContainerBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  function handleTypeClick(type: InternalLinkType) {
    setActiveType(type);
    setSearch("");
    if (type !== "Custom") {
      // Focus the search input in panel 2
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }

  function handleItemSelect(href: string, label: string) {
    onChange(href);
    setSelectedLabel(label);
    setOpen(false);
    setActiveType(null);
    setSearch("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setSelectedLabel("");
    setActiveType(null);
    setSearch("");
  }

  const displayValue = value ? (selectedLabel || value) : "";

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onBlur={handleContainerBlur}
    >
      {/* Trigger */}
      <div className="relative">
        <Input
          readOnly={!open || activeType !== "Custom"}
          value={activeType === "Custom" ? value : displayValue}
          onChange={activeType === "Custom" ? (e) => onChange(e.target.value) : undefined}
          onFocus={() => setOpen(true)}
          placeholder="Select link…"
          className={cn("h-8 text-xs pr-7", glassy && GLASS)}
        />
        {value && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="size-3" />
          </button>
        )}
      </div>

      {/* Cascading dropdown */}
      {open && (
        <div
          className={cn(
            "absolute left-0 z-50 flex gap-1",
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >

          {/* Panel 1 — link types */}
          <div className="w-36 shrink-0 rounded-lg border bg-card shadow-lg py-1">
            {LINK_TYPES.map((lt) => (
              <button
                key={lt.value}
                type="button"
                tabIndex={0}
                onClick={() => handleTypeClick(lt.value)}
                className={cn(
                  "flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs transition-colors",
                  activeType === lt.value ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                )}
              >
                <span className="flex-1">{lt.label}</span>
                {lt.value !== "Custom" && (
                  <ChevronRightIcon className="size-3 shrink-0 opacity-40" />
                )}
              </button>
            ))}
          </div>

          {/* Panel 2 — items or custom input */}
          {activeType !== null && (
            <div className="w-64 rounded-lg border bg-card shadow-lg overflow-hidden">
              {activeType === "Custom" ? (
                <div className="p-2">
                  <Input
                    ref={searchRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="/path or https://…"
                    className="h-8 text-xs"
                  />
                </div>
              ) : (
                <>
                  <div className="border-b p-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        ref={searchRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${LINK_TYPES.find((l) => l.value === activeType)?.label.toLowerCase()}s…`}
                        className="h-7 text-xs pl-7"
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto p-1">
                    {isLoading ? (
                      <p className="py-3 text-center text-xs text-muted-foreground">Loading…</p>
                    ) : items.length === 0 ? (
                      <p className="py-3 text-center text-xs text-muted-foreground">No results found.</p>
                    ) : (
                      items.map((item) => (
                        <ResultItem
                          key={item.refId}
                          label={item.label}
                          href={item.href}
                          imageKey={item.imageKey}
                          selected={value === item.href}
                          onClick={() => handleItemSelect(item.href, item.label)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
