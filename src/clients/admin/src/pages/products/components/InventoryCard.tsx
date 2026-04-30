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
import { Switch } from "@/components/ui/switch";
import type { FormValues, Variant, VariantOverride } from "./types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  watchTrackInventory: boolean;
  selectedVariant: Variant | null;
  onUpdateVariant: (localId: string, update: Partial<VariantOverride>) => void;
};

export function InventoryCard({
  register,
  control,
  watchTrackInventory,
  selectedVariant,
  onUpdateVariant,
}: Props) {
  const inherited = selectedVariant?.useProductInventory ?? false;

  // When a variant is selected, read from variant state; otherwise from product form.
  const trackInventory = selectedVariant ? selectedVariant.trackInventory : watchTrackInventory;

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
                checked={inherited}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { useProductInventory: v })}
              />
            </div>
          )}

          <Field orientation="horizontal">
            <FieldLabel>Track inventory</FieldLabel>
            {selectedVariant ? (
              <Switch
                checked={selectedVariant.trackInventory}
                disabled={inherited}
                onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { trackInventory: v })}
              />
            ) : (
              <Controller
                control={control}
                name="trackInventory"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    type="number"
                    min="0"
                    value={selectedVariant.stock}
                    onChange={(e) => onUpdateVariant(selectedVariant.localId, { stock: e.target.value })}
                    placeholder="0"
                  />
                ) : (
                  <Input type="number" min="0" {...register("stock")} placeholder="0" />
                )}
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>Continue selling when out of stock</FieldLabel>
                {selectedVariant ? (
                  <Switch
                    checked={selectedVariant.allowBackorder}
                    disabled={inherited}
                    onCheckedChange={(v) => onUpdateVariant(selectedVariant.localId, { allowBackorder: v })}
                  />
                ) : (
                  <Controller
                    control={control}
                    name="allowBackorder"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                )}
              </Field>

              <Field>
                <FieldLabel>Low stock threshold</FieldLabel>
                {selectedVariant ? (
                  <Input
                    type="number"
                    min="0"
                    value={selectedVariant.lowStockThreshold}
                    disabled={inherited}
                    onChange={(e) => onUpdateVariant(selectedVariant.localId, { lowStockThreshold: e.target.value })}
                    placeholder="e.g. 5"
                  />
                ) : (
                  <Input
                    type="number"
                    min="0"
                    {...register("lowStockThreshold")}
                    placeholder="e.g. 5"
                  />
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
