import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormGetValues, UseFormRegister } from "react-hook-form";

import { validateNonNegativeNumber } from "./helpers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { FormValues, Variant, VariantOverride } from "./types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  watchTrackInventory: boolean;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
  getProductValues: UseFormGetValues<FormValues>;
};

export function InventoryCard({
  register,
  control,
  errors,
  watchTrackInventory,
  selectedVariant,
  onUpdateVariant,
  getProductValues,
}: Props) {
  // True when a variant is selected AND it is overriding (not inheriting from product).
  const useVariantInventory = selectedVariant !== null && !selectedVariant.useProductInventory;
  const inheriting = !!selectedVariant?.useProductInventory;

  function handleToggleUseProductInventory(useProduct: boolean) {
    if (!selectedVariant) return;
    if (useProduct) {
      onUpdateVariant(selectedVariant.localId, { useProductInventory: true });
    } else {
      // Going inherit → override: seed variant with current product values
      // (stock is per-variant — leave it alone).
      const v = getProductValues();
      onUpdateVariant(selectedVariant.localId, {
        useProductInventory: false,
        trackInventory: v.trackInventory ?? true,
        allowBackorder: v.allowBackorder ?? false,
        lowStockThreshold: v.lowStockThreshold ?? "",
      });
    }
  }

  // Effective track-inventory drives whether the dependent fields render.
  // When inheriting (or no variant selected) → product form value.
  // When overriding → variant's own value.
  const trackInventory = useVariantInventory ? selectedVariant.trackInventory : watchTrackInventory;

  return (
    <Card>
      <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          {selectedVariant && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Use product inventory</span>
                <span className="text-xs text-muted-foreground">{selectedVariant.label}</span>
              </div>
              <Switch
                checked={selectedVariant.useProductInventory}
                onCheckedChange={handleToggleUseProductInventory}
              />
            </div>
          )}

          <Field orientation="horizontal">
            <FieldLabel>Track inventory</FieldLabel>
            {useVariantInventory ? (
              <Switch
                checked={selectedVariant.trackInventory}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { trackInventory: v })}
              />
            ) : (
              <Controller
                control={control}
                name="trackInventory"
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

          {trackInventory && (
            <>
              <Field>
                <FieldLabel>Quantity</FieldLabel>
                {selectedVariant ? (
                  <Input
                    key="stock-variant"
                    type="number"
                    min="0"
                    value={selectedVariant.stock}
                    onChange={(e) => onUpdateVariant(selectedVariant.localId, { stock: e.target.value })}
                    placeholder="0"
                  />
                ) : (
                  <Input
                    key="stock-product"
                    type="number"
                    min="0"
                    {...register("stock", { validate: validateNonNegativeNumber("Quantity") })}
                    placeholder="0"
                  />
                )}
                {!selectedVariant && errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock.message}</p>
                )}
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Continue selling when out of stock</FieldLabel>
                {useVariantInventory ? (
                  <Switch
                    checked={selectedVariant.allowBackorder}
                    onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { allowBackorder: v })}
                  />
                ) : (
                  <Controller
                    control={control}
                    name="allowBackorder"
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

              <Field>
                <FieldLabel>Low stock threshold</FieldLabel>
                {useVariantInventory ? (
                  <Input
                    key="low-stock-override"
                    type="number"
                    min="0"
                    value={selectedVariant.lowStockThreshold}
                    onChange={(e) => onUpdateVariant(selectedVariant.localId, { lowStockThreshold: e.target.value })}
                    placeholder="e.g. 5"
                  />
                ) : (
                  <Input
                    key="low-stock-inherit"
                    type="number"
                    min="0"
                    {...register("lowStockThreshold", {
                      validate: validateNonNegativeNumber("Low stock threshold"),
                    })}
                    disabled={inheriting}
                    placeholder="e.g. 5"
                  />
                )}
                {!useVariantInventory && errors.lowStockThreshold && (
                  <p className="text-xs text-destructive">{errors.lowStockThreshold.message}</p>
                )}
                <FieldDescription>Alert when stock falls below this number</FieldDescription>
              </Field>
            </>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
