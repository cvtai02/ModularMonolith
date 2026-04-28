import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/file-uploader";
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
import type { CategoryResponse } from "@shared/api/api-types";
import type { FormValues } from "./types";

type Props = {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  categories: CategoryResponse[];
};

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "2", label: "Draft" },
  { value: "0", label: "Archived" },
] as const;

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
                    <SelectValue placeholder="Select a category…" />
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
              name="imageUrl"
              render={({ field }) => (
                <FileUploader
                  category="product"
                  accept="image/*"
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? "")}
                />
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
