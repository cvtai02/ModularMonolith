import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormGetValues, UseFormRegister } from "react-hook-form";

import { validateNonNegativeNumber } from "./helpers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { FormValues, Variant, VariantOverride } from "./types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
  watchIsPhysical: boolean;
  getProductValues: UseFormGetValues<FormValues>;
};

export function ShippingCard({
  register,
  control,
  errors,
  selectedVariant,
  onUpdateVariant,
  watchIsPhysical,
  getProductValues,
}: Props) {
  // True when a variant is selected AND it is overriding (not inheriting from product).
  const useVariantShipping = selectedVariant !== null && !selectedVariant.useProductShipping;
  const inheriting = !!selectedVariant?.useProductShipping;

  function handleToggleUseProductShipping(useProduct: boolean) {
    if (!selectedVariant) return;
    if (useProduct) {
      onUpdateVariant(selectedVariant.localId, { useProductShipping: true });
    } else {
      // Going inherit → override: seed variant with current product values.
      const v = getProductValues();
      onUpdateVariant(selectedVariant.localId, {
        useProductShipping: false,
        physicalProduct: v.isPhysical ?? true,
        weight: v.weight ?? "",
        width: v.width ?? "",
        height: v.height ?? "",
        length: v.length ?? "",
      });
    }
  }

  // Effective "physical product" value drives whether dimensions show.
  const effectivePhysical = useVariantShipping ? selectedVariant.physicalProduct : watchIsPhysical;

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
                onCheckedChange={handleToggleUseProductShipping}
              />
            </div>
          )}

          <Field orientation="horizontal">
            <FieldLabel>Physical product</FieldLabel>
            {useVariantShipping ? (
              <Switch
                checked={selectedVariant.physicalProduct}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { physicalProduct: v })}
              />
            ) : (
              <Controller
                control={control}
                name="isPhysical"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    disabled={inheriting}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            )}
          </Field>

          {effectivePhysical && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(["width", "height", "length"] as const).map((dim) => (
                  <Field key={dim}>
                    <FieldLabel>{dim.charAt(0).toUpperCase()} (cm)</FieldLabel>
                    {useVariantShipping ? (
                      <Input
                        key={`${dim}-override`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={selectedVariant[dim]}
                        onChange={(e) => onUpdateVariant(selectedVariant.localId, { [dim]: e.target.value })}
                        placeholder="0"
                      />
                    ) : (
                      <Input
                        key={`${dim}-inherit`}
                        type="number"
                        min="0"
                        step="0.1"
                        {...register(dim, { validate: validateNonNegativeNumber(dim) })}
                        disabled={inheriting}
                        placeholder="0"
                      />
                    )}
                    {!useVariantShipping && errors[dim] && (
                      <p className="text-xs text-destructive">{errors[dim]?.message}</p>
                    )}
                  </Field>
                ))}
              </div>

              <Field>
                <FieldLabel>Weight (g)</FieldLabel>
                {useVariantShipping ? (
                  <Input
                    key="weight-override"
                    type="number"
                    min="0"
                    step="1"
                    value={selectedVariant.weight}
                    onChange={(e) => onUpdateVariant(selectedVariant.localId, { weight: e.target.value })}
                    placeholder="0"
                  />
                ) : (
                  <Input
                    key="weight-inherit"
                    type="number"
                    min="0"
                    step="1"
                    {...register("weight", { validate: validateNonNegativeNumber("Weight") })}
                    disabled={inheriting}
                    placeholder="0"
                  />
                )}
                {!useVariantShipping && errors.weight && (
                  <p className="text-xs text-destructive">{errors.weight.message}</p>
                )}
              </Field>
            </>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
