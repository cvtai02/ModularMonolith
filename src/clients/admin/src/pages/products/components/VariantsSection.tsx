import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Variant } from "./types";

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

type Props = {
  variants: Variant[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onVariantClick: (id: string, ctrl: boolean) => void;
  variantGroups: Map<string, Variant[]> | null;
  productPrice: string;
};

export function VariantsSection({
  variants,
  selectedIds,
  setSelectedIds,
  onVariantClick,
  variantGroups,
  productPrice,
}: Props) {
  const hasVariants = variants.length > 0;

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
                <DropdownMenuItem onClick={() => toast.info(`Edit price for ${selectedIds.size} variants`)}>
                  Edit price
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Edit inventory for ${selectedIds.size} variants`)}>
                  Edit inventory
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
    </Card>
  );
}
