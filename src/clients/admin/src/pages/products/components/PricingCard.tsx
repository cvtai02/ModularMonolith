import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormGetValues, UseFormRegister } from "react-hook-form";

import {
  validateNonNegativeNumber,
  validateRequiredNonNegativeNumber,
} from "./helpers";

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

import { currencies } from "@shared/api/contracts/common-types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  watchPrice: string;
  watchCostPrice: string;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
  getProductValues: UseFormGetValues<FormValues>;
};

export function PricingCard({
  register,
  control,
  errors,
  watchPrice,
  watchCostPrice,
  selectedVariant,
  onUpdateVariant,
  getProductValues,
}: Props) {
  const useVariantPricing = selectedVariant !== null && !selectedVariant.useProductPrice;

  function handleToggleUseProductPrice(useProduct: boolean) {
    if (!selectedVariant) return;
    if (useProduct) {
      onUpdateVariant(selectedVariant.localId, { useProductPrice: true });
    } else {
      // Going inherit → override: seed variant with current product values
      // so the inputs keep showing what the user just saw.
      const v = getProductValues();
      onUpdateVariant(selectedVariant.localId, {
        useProductPrice: false,
        price: v.price ?? "",
        compareAtPrice: v.compareAtPrice ?? "",
        costPrice: v.costPrice ?? "",
        chargeTax: v.chargeTax ?? false,
      });
    }
  }

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
                onCheckedChange={handleToggleUseProductPrice}
              />
            </div>
          )}

          <Field>
            <FieldLabel>Price</FieldLabel>
            <div className="flex gap-2">
              {useVariantPricing ? (
                <Input
                  key="price-override"
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
                  key="price-inherit"
                  type="number"
                  min="0"
                  step="1000"
                  {...register("price", {
                    validate: validateRequiredNonNegativeNumber("Price"),
                  })}
                  disabled={!!selectedVariant?.useProductPrice}
                  placeholder="0"
                  className="flex-1"
                />
              )}
              <Controller
                control={control}
                name="currency"
                render={({ field }) => {
                  const code = currencies.includes(field.value as typeof currencies[number]) ? field.value : currencies[0];
                  return (
                    <Select
                      value={code}
                      onValueChange={(v) => field.onChange(v)}
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
            {!useVariantPricing && errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel>Compare-at price</FieldLabel>
            {useVariantPricing ? (
              <Input
                key="compare-override"
                type="number"
                min="0"
                step="1000"
                value={selectedVariant.compareAtPrice}
                onChange={(e) => onUpdateVariant(selectedVariant.localId, { compareAtPrice: e.target.value })}
                placeholder="0"
              />
            ) : (
              <Input
                key="compare-inherit"
                type="number"
                min="0"
                step="1000"
                {...register("compareAtPrice", {
                  validate: (v, formValues) => {
                    if (v === "" || v === null || v === undefined) return true;
                    const n = Number(v);
                    if (Number.isNaN(n)) return "Compare-at price must be a number";
                    if (n < 0) return "Compare-at price must be 0 or greater";
                    if (n > 0 && formValues.price) {
                      const price = Number(formValues.price);
                      if (!Number.isNaN(price) && n < price) {
                        return "Compare-at price must be ≥ regular price";
                      }
                    }
                    return true;
                  },
                })}
                disabled={!!selectedVariant?.useProductPrice}
                placeholder="0"
              />
            )}
            {!useVariantPricing && errors.compareAtPrice && (
              <p className="text-xs text-destructive">{errors.compareAtPrice.message}</p>
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
                key="cost-override"
                type="number"
                min="0"
                step="1000"
                value={selectedVariant.costPrice}
                onChange={(e) => onUpdateVariant(selectedVariant.localId, { costPrice: e.target.value })}
                placeholder="0"
              />
            ) : (
              <Input
                key="cost-inherit"
                type="number"
                min="0"
                step="1000"
                {...register("costPrice", {
                  validate: validateNonNegativeNumber("Cost"),
                })}
                disabled={!!selectedVariant?.useProductPrice}
                placeholder="0"
              />
            )}
            {!useVariantPricing && errors.costPrice && (
              <p className="text-xs text-destructive">{errors.costPrice.message}</p>
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
