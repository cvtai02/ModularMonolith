import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Variant, VariantOverride } from "./types";

type VariantRowProps = {
  variant: Variant;
  isSelected: boolean;
  onSelect: (ctrl: boolean) => void;
  productPrice: string;
  indent?: boolean;
};

function fmtPrice(raw: string, productPrice: string) {
  const n = Number(raw || productPrice);
  if (!n) return "—";
  return `${n.toLocaleString("vi-VN")} ₫`;
}

function VariantRow({ variant, isSelected, onSelect, productPrice, indent }: VariantRowProps) {
  const priceInherited = variant.useProductPrice;
  const price = fmtPrice(priceInherited ? productPrice : variant.price, productPrice);

  const stock = variant.stock ? Number(variant.stock).toLocaleString() : "0";

  let shipping: string;
  if (variant.useProductShipping) {
    shipping = "ship: prod";
  } else if (!variant.physicalProduct) {
    shipping = "digital";
  } else if (variant.weight) {
    shipping = `${variant.weight} g`;
  } else {
    shipping = "physical";
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col gap-0.5 rounded-md px-2 py-2 transition-colors",
        indent && "ml-6",
        isSelected ? "bg-accent" : "hover:bg-muted/50"
      )}
      onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
    >
      <span className="text-sm">{variant.label}</span>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className={cn("font-mono", !priceInherited && "text-foreground font-medium")}>{price}</span>
        <span>·</span>
        <span>qty {stock}</span>
        <span>·</span>
        <span>{shipping}</span>
      </div>
    </div>
  );
}

// ─── Bulk edit dialog ─────────────────────────────────────────────────────────

type BulkEditMode = "price" | "inventory" | "shipping";

function BulkEditDialog({
  mode,
  count,
  onApply,
  onClose,
}: {
  mode: BulkEditMode;
  count: number;
  onApply: (update: Partial<VariantOverride>) => void;
  onClose: () => void;
}) {
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [stock, setStock] = useState("");
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [physicalProduct, setPhysicalProduct] = useState(true);
  const [weight, setWeight] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [length, setLength] = useState("");

  const handleApply = () => {
    if (mode === "price") {
      onApply({
        useProductPrice: false,
        ...(price && { price }),
        ...(compareAtPrice && { compareAtPrice }),
        ...(costPrice && { costPrice }),
      });
    } else if (mode === "inventory") {
      onApply({
        useProductInventory: false,
        trackInventory,
        ...(stock && { stock }),
        allowBackorder,
        ...(lowStockThreshold && { lowStockThreshold }),
      });
    } else {
      onApply({
        useProductShipping: false,
        physicalProduct,
        ...(weight && { weight }),
        ...(width && { width }),
        ...(height && { height }),
        ...(length && { length }),
      });
    }
    onClose();
  };

  const titles: Record<BulkEditMode, string> = {
    price: "Edit price",
    inventory: "Edit inventory",
    shipping: "Edit shipping",
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titles[mode]} — {count} variant{count > 1 ? "s" : ""}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          {mode === "price" && (
            <>
              <Field>
                <FieldLabel>Price</FieldLabel>
                <Input type="number" min="0" step="1000" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave empty to keep existing" />
              </Field>
              <Field>
                <FieldLabel>Compare-at price</FieldLabel>
                <Input type="number" min="0" step="1000" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Leave empty to keep existing" />
              </Field>
              <Field>
                <FieldLabel>Cost per item</FieldLabel>
                <Input type="number" min="0" step="1000" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="Leave empty to keep existing" />
              </Field>
            </>
          )}
          {mode === "inventory" && (
            <>
              <Field orientation="horizontal">
                <FieldLabel>Track inventory</FieldLabel>
                <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
              </Field>
              {trackInventory && (
                <>
                  <Field>
                    <FieldLabel>Quantity</FieldLabel>
                    <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
                  </Field>
                  <Field orientation="horizontal">
                    <FieldLabel>Continue selling when out of stock</FieldLabel>
                    <Switch checked={allowBackorder} onCheckedChange={setAllowBackorder} />
                  </Field>
                  <Field>
                    <FieldLabel>Low stock threshold</FieldLabel>
                    <Input type="number" min="0" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} placeholder="e.g. 5" />
                  </Field>
                </>
              )}
            </>
          )}
          {mode === "shipping" && (
            <>
              <Field orientation="horizontal">
                <FieldLabel>Physical product</FieldLabel>
                <Switch checked={physicalProduct} onCheckedChange={setPhysicalProduct} />
              </Field>
              {physicalProduct && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {(["width", "height", "length"] as const).map((dim, i) => (
                      <Field key={dim}>
                        <FieldLabel>{dim.charAt(0).toUpperCase()} (cm)</FieldLabel>
                        <Input
                          type="number" min="0" step="0.1"
                          value={[width, height, length][i]}
                          onChange={(e) => [setWidth, setHeight, setLength][i](e.target.value)}
                          placeholder="0"
                        />
                      </Field>
                    ))}
                  </div>
                  <Field>
                    <FieldLabel>Weight (g)</FieldLabel>
                    <Input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" />
                  </Field>
                </>
              )}
            </>
          )}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleApply}>Apply to {count} variant{count > 1 ? "s" : ""}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

type Props = {
  variants: Variant[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onVariantClick: (id: string, ctrl: boolean) => void;
  variantGroups: Map<string, Variant[]> | null;
  productPrice: string;
  onBulkUpdateVariants: (ids: Set<string>, update: Partial<VariantOverride>) => void;
};

export function VariantsSection({
  variants,
  selectedIds,
  setSelectedIds,
  onVariantClick,
  variantGroups,
  productPrice,
  onBulkUpdateVariants,
}: Props) {
  const hasVariants = variants.length > 0;
  const [bulkMode, setBulkMode] = useState<BulkEditMode | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Variants</CardTitle>
          {selectedIds.size > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="icon" type="button">
                    <MoreHorizontalIcon className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setBulkMode("price")}>
                  Edit price
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBulkMode("inventory")}>
                  Edit inventory
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBulkMode("shipping")}>
                  Edit shipping
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasVariants ? (
          <div className="flex items-center justify-between rounded-md border border-dashed px-3 py-2.5">
            <span className="text-sm text-muted-foreground">Default variant</span>
            <Badge variant="secondary">No options</Badge>
          </div>
        ) : variantGroups ? (
          <div className="flex flex-col gap-0.5">
            {Array.from(variantGroups.entries()).map(([groupKey, groupVariants]) => {
              const allGroupSelected = groupVariants.every((v) => selectedIds.has(v.localId));
              return (
                <div key={groupKey}>
                  <div
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                    onClick={(e) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (e.ctrlKey || e.metaKey) {
                          if (allGroupSelected) groupVariants.forEach((v) => next.delete(v.localId));
                          else groupVariants.forEach((v) => next.add(v.localId));
                        } else {
                          next.clear();
                          if (!allGroupSelected || prev.size !== groupVariants.length) {
                            groupVariants.forEach((v) => next.add(v.localId));
                          }
                        }
                        return next;
                      });
                    }}
                  >
                    <span className="flex-1 text-sm font-medium">{groupKey}</span>
                    <span className="text-xs text-muted-foreground">{groupVariants.length} variants</span>
                  </div>
                  {groupVariants.map((v) => (
                    <VariantRow
                      key={v.localId}
                      variant={v}
                      isSelected={selectedIds.has(v.localId)}
                      onSelect={(ctrl) => onVariantClick(v.localId, ctrl)}
                      productPrice={productPrice}
                      indent
                    />
                  ))}
                  <Separator className="my-1" />
                </div>
              );
            })}
            <p className="mt-1 text-xs text-muted-foreground">
              Hold <kbd className="rounded border px-1 font-mono text-[10px]">Ctrl</kbd> to select multiple variants
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {variants.map((v) => (
              <VariantRow
                key={v.localId}
                variant={v}
                isSelected={selectedIds.has(v.localId)}
                onSelect={(ctrl) => onVariantClick(v.localId, ctrl)}
                productPrice={productPrice}
              />
            ))}
            <p className="mt-1 text-xs text-muted-foreground">
              Hold <kbd className="rounded border px-1 font-mono text-[10px]">Ctrl</kbd> to select multiple variants
            </p>
          </div>
        )}
      </CardContent>

      {bulkMode && (
        <BulkEditDialog
          mode={bulkMode}
          count={selectedIds.size}
          onApply={(update) => onBulkUpdateVariants(selectedIds, update)}
          onClose={() => setBulkMode(null)}
        />
      )}
    </Card>
  );
}
