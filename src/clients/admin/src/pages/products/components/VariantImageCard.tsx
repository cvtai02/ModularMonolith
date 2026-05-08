import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImagePickerField } from "@/components/admin/image-picker-field";
import type { Variant } from "./types";

type Props = {
  selectedVariant: Variant;
  /** Called with the new imageKey; caller is responsible for propagating to the full group. */
  onChangeImage: (imageKey: string) => void;
};

export function VariantImageCard({ selectedVariant, onChangeImage }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant image</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          {selectedVariant.label}
        </p>
        <SingleImagePickerField
          value={selectedVariant.imageKey}
          onChange={onChangeImage}
        />
      </CardContent>
    </Card>
  );
}
