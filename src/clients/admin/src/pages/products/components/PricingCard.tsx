import { Controller } from "react-hook-form";
import type { Control, UseFormRegister } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FormValues, Variant, VariantOverride } from "./types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  watchPrice: string;
  watchCostPrice: string;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
};

export function PricingCard({
  register,
  control,
  watchPrice,
  watchCostPrice,
  selectedVariant,
  onUpdateVariant,
}: Props) {
  const price = parseFloat(watchPrice) || 0;
  const cost = parseFloat(watchCostPrice) || 0;
  const profit = price > 0 && cost > 0 ? price - cost : null;
  const margin = profit !== null && price > 0 ? ((profit / price) * 100).toFixed(1) : null;

  return (
    <Card>
      <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          {selectedVariant && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Use product price</span>
                <span className="text-xs text-muted-foreground">{selectedVariant.label}</span>
              </div>
              <Switch
                checked={selectedVariant.useProductPrice}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { useProductPrice: v })}
              />
            </div>
          )}

          <Field>
            <FieldLabel>Price (VND)</FieldLabel>
            {selectedVariant && !selectedVariant.useProductPrice ? (
              <Input
                type="number"
                min="0"
                step="1000"
                value={selectedVariant.price}
                onChange={(e) => onUpdateVariant(selectedVariant.localId, { price: e.target.value })}
                placeholder="0"
              />
            ) : (
              <Input
                type="number"
                min="0"
                step="1000"
                {...register("price")}
                disabled={!!selectedVariant?.useProductPrice}
                placeholder="0"
              />
            )}
          </Field>

          <Field>
            <FieldLabel>Compare-at price (VND)</FieldLabel>
            <Input
              type="number"
              min="0"
              step="1000"
              {...register("compareAtPrice")}
              disabled={!!selectedVariant?.useProductPrice}
              placeholder="0"
            />
          </Field>

          <Field orientation="horizontal">
            <FieldLabel>Charge tax</FieldLabel>
            <Controller
              control={control}
              name="chargeTax"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </Field>

          <Separator />

          <Field>
            <FieldLabel>Cost per item (VND)</FieldLabel>
            <Input
              type="number"
              min="0"
              step="1000"
              {...register("costPrice")}
              placeholder="0"
            />
            <FieldDescription>Customers won't see this</FieldDescription>
          </Field>

          {profit !== null && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className={cn("text-sm font-medium", profit >= 0 ? "text-emerald-600" : "text-destructive")}>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(profit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margin</p>
                <p className={cn("text-sm font-medium", profit >= 0 ? "text-emerald-600" : "text-destructive")}>
                  {margin}%
                </p>
              </div>
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
