import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { PlusIcon, XIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryResponse } from "@shared/api/types/productcatalog";
import type { FormValues } from "./types";
import { MediaPickerModal } from "./MediaPickerModal";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  categories: CategoryResponse[];
};

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Unlisted", label: "Unlisted" },
] as const;

function ImagePickerField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const removeImage = (url: string) => {
    onChange(value.filter((x) => x !== url));
  };

  const addImage = (url: string) => {
    if (!url) return;

    // avoid duplicate
    if (value.includes(url)) return;

    onChange([...value, url]);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="group relative size-40 shrink-0 overflow-hidden rounded-xl border bg-muted"
          >
            <img
              src={url}
              alt="Product"
              className="size-full cursor-pointer object-cover"
              onClick={() => setOpen(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0.3";
              }}
            />

            <button
              type="button"
              aria-label="Remove image"
              onClick={() => removeImage(url)}
              className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-40 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
        >
          <PlusIcon className="size-9 opacity-50" />
          <span className="text-xs">Add image</span>
        </button>
      </div>

      <MediaPickerModal
        open={open}
        onOpenChange={setOpen}
        selectedUrl={value[0] ?? ""}
        onSelect={addImage}
      />
    </>
  );
}

export function GeneralSection({ register, control, errors, categories }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>General</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Title *</FieldLabel>
            <Input
              {...register("name", { required: "Title is required" })}
              placeholder="Short sleeve t-shirt"
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Category *</FieldLabel>
            <Controller
              control={control}
              name="categoryId"
              rules={{ required: "Category is required", min: { value: 1, message: "Category is required" } }}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(v) => field.onChange(parseInt(v!))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category…">
                      {field.value
                        ? categories.find((c) => c.id === field.value)?.name
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea {...register("description")} placeholder="Describe your product…" rows={4} />
          </Field>

          <Field>
            <FieldLabel>Product Image</FieldLabel>
            <Controller
              control={control}
              name="mediaUrls"
              render={({ field }) => (
                <ImagePickerField value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4 pt-1"
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`status-${value}`} />
                      <FieldLabel htmlFor={`status-${value}`} className="font-normal cursor-pointer">
                        {label}
                      </FieldLabel>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
