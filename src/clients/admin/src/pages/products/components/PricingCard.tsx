import { Controller } from "react-hook-form";
import type { Control, UseFormRegister } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FormValues, Variant, VariantOverride } from "./types";

import { currencies } from "@shared/api/common-types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  watchPrice: string;
  watchCostPrice: string;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
  isCreating?: boolean;
};

export function PricingCard({
  register,
  control,
  watchPrice,
  watchCostPrice,
  selectedVariant,
  onUpdateVariant,
  isCreating,
}: Props) {
  const useVariantPricing = selectedVariant !== null && !selectedVariant.useProductPrice;

  const effectivePrice = useVariantPricing
    ? parseFloat(selectedVariant.price) || 0
    : parseFloat(watchPrice) || 0;
  const effectiveCost = useVariantPricing
    ? parseFloat(selectedVariant.costPrice) || 0
    : parseFloat(watchCostPrice) || 0;
  const profit = effectivePrice > 0 && effectiveCost > 0 ? effectivePrice - effectiveCost : null;
  const margin = profit !== null && effectivePrice > 0 ? ((profit / effectivePrice) * 100).toFixed(1) : null;

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
                disabled={isCreating}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { useProductPrice: v })}
              />
            </div>
          )}

          <Field>
            <FieldLabel>Price</FieldLabel>
            <div className="flex gap-2">
              {useVariantPricing ? (
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={selectedVariant.price}
                  onChange={(e) => onUpdateVariant(selectedVariant.localId, { price: e.target.value })}
                  placeholder="0"
                  className="flex-1"
                />
              ) : (
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  {...register("price")}
                  disabled={!!selectedVariant?.useProductPrice}
                  placeholder="0"
                  className="flex-1"
                />
              )}
              <Controller
                control={control}
                name="currency"
                render={({ field }) => {
                  const code = currencies[field.value] ?? currencies[0];
                  return (
                    <Select
                      value={code}
                      onValueChange={(v) => field.onChange(currencies.indexOf(v as typeof currencies[number]))}
                      disabled={!!selectedVariant}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue>{code}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel>Compare-at price</FieldLabel>
            {useVariantPricing ? (
              <Input
                type="number"
                min="0"
                step="1000"
                value={selectedVariant.compareAtPrice}
                onChange={(e) => onUpdateVariant(selectedVariant.localId, { compareAtPrice: e.target.value })}
                placeholder="0"
              />
            ) : (
              <Input
                type="number"
                min="0"
                step="1000"
                {...register("compareAtPrice")}
                disabled={!!selectedVariant?.useProductPrice}
                placeholder="0"
              />
            )}
          </Field>

          <Field orientation="horizontal">
            <FieldLabel>Charge tax</FieldLabel>
            {useVariantPricing ? (
              <Switch
                checked={selectedVariant.chargeTax}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { chargeTax: v })}
              />
            ) : (
              <Controller
                control={control}
                name="chargeTax"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    disabled={!!selectedVariant?.useProductPrice}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            )}
          </Field>

          <Separator />

          <Field>
            <FieldLabel>Cost per item</FieldLabel>
            {useVariantPricing ? (
              <Input
                type="number"
                min="0"
                step="1000"
                value={selectedVariant.costPrice}
                onChange={(e) => onUpdateVariant(selectedVariant.localId, { costPrice: e.target.value })}
                placeholder="0"
              />
            ) : (
              <Input
                type="number"
                min="0"
                step="1000"
                {...register("costPrice")}
                placeholder="0"
              />
            )}
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
