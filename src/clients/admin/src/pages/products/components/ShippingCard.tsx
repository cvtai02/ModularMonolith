import { Controller } from "react-hook-form";
import type { Control, UseFormRegister } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { FormValues, Variant, VariantOverride } from "./types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
  isCreating?: boolean;
  watchIsPhysical: boolean;
};

export function ShippingCard({
  register,
  control,
  selectedVariant,
  onUpdateVariant,
  isCreating,
  watchIsPhysical,
}: Props) {
  const useVariantShipping = selectedVariant !== null && !selectedVariant.useProductShipping;
  const productDimensionsDisabled = !!selectedVariant?.useProductShipping;

  return (
    <Card>
      <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          {selectedVariant && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Use product shipping</span>
                <span className="text-xs text-muted-foreground">{selectedVariant.label}</span>
              </div>
              <Switch
                checked={selectedVariant.useProductShipping}
                disabled={isCreating}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { useProductShipping: v })}
              />
            </div>
          )}

          <Field orientation="horizontal">
            <FieldLabel>Physical product</FieldLabel>
            <Controller
              control={control}
              name="isPhysical"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </Field>

          {watchIsPhysical && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(["width", "height", "length"] as const).map((dim) => (
                  <Field key={dim}>
                    <FieldLabel>{dim.charAt(0).toUpperCase()} (cm)</FieldLabel>
                    {useVariantShipping ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={selectedVariant[dim]}
                        onChange={(e) => onUpdateVariant(selectedVariant.localId, { [dim]: e.target.value })}
                        placeholder="0"
                      />
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        {...register(dim)}
                        disabled={productDimensionsDisabled}
                        placeholder="0"
                      />
                    )}
                  </Field>
                ))}
              </div>

              <Field>
                <FieldLabel>Weight (kg)</FieldLabel>
                {useVariantShipping ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedVariant.weight}
                    onChange={(e) => onUpdateVariant(selectedVariant.localId, { weight: e.target.value })}
                    placeholder="0"
                  />
                ) : (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("weight")}
                    disabled={productDimensionsDisabled}
                    placeholder="0"
                  />
                )}
              </Field>
            </>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
