import { useCallback, useState } from "react";
import { Controller, useForm, useFieldArray, useWatch } from "react-hook-form";
import { ArrowLeftIcon, GripVerticalIcon, ImageIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerModal } from "@/pages/products/components/MediaPickerModal";
import { InternalLinkInput } from "@/components/admin/internal-link-input";
import { resolveMediaUrl, urlToMediaKey } from "@/lib/media";
import { applyValidationErrors } from "@/lib/form-error";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GalleryItemFormValues = {
  imageKey: string;
  name: string;
  note: string;
  link: string;
};

export type GalleryFormValues = {
  key: string;
  name: string;
  note: string;
  isPublic: boolean;
  items: GalleryItemFormValues[];
};

export type GalleryItemCardProps = {
  index: number;
  control: ReturnType<typeof useForm<GalleryFormValues>>["control"];
  register: ReturnType<typeof useForm<GalleryFormValues>>["register"];
  onRemove: () => void;
};

interface Props {
  pageTitle: string;
  defaultValues?: Partial<GalleryFormValues>;
  isPending: boolean;
  showKeyField?: boolean;
  ItemCard?: React.ComponentType<GalleryItemCardProps>;
  onDiscard: () => void;
  onSubmit: (values: GalleryFormValues) => Promise<void>;
}

// ─── Default item card ────────────────────────────────────────────────────────

function GalleryItemCard({
  index,
  control,
  register,
  onRemove,
}: GalleryItemCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const imageKey = useWatch({ control, name: `items.${index}.imageKey` });
  const displayUrl = resolveMediaUrl(imageKey ?? "");

  return (
    <div className="relative w-full rounded-xl border bg-card" style={{ paddingBottom: "75%" }}>

      {/* Image — clipped independently so it doesn't escape the rounded corners */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {displayUrl ? (
          <img src={displayUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="size-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
            <ImageIcon className="size-8 opacity-30" />
            <span className="text-xs opacity-50">Click to add image</span>
          </div>
        )}
      </div>

      {/* Click target for image picker — sits above the image, below the overlay */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="absolute inset-0 rounded-xl z-[1]"
        aria-label="Change image"
      />

      {/* Top controls: grip + delete */}
      <div className="absolute top-2 inset-x-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-center size-7 rounded-md bg-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing text-foreground/60 shadow-sm">
          <GripVerticalIcon className="size-4" />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="pointer-events-auto flex items-center justify-center size-7 rounded-md bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors shadow-sm"
          aria-label="Remove item"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>

      {/* Bottom input overlay — transparent container, blur lives on each input */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-3 pt-2.5 pb-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            {...register(`items.${index}.name`)}
            placeholder="Name"
            className="h-8 text-xs backdrop-blur-md bg-black/30 border-white/20 text-white placeholder:text-white/50 focus-visible:border-white/50"
          />
          <Input
            {...register(`items.${index}.note`)}
            placeholder="Note"
            className="h-8 text-xs backdrop-blur-md bg-black/30 border-white/20 text-white placeholder:text-white/50 focus-visible:border-white/50"
          />
        </div>
        <Controller
          control={control}
          name={`items.${index}.link`}
          render={({ field }) => (
            <InternalLinkInput value={field.value} onChange={field.onChange} glassy />
          )}
        />
      </div>

      {/* Single-image picker (replace) */}
      <Controller
        control={control}
        name={`items.${index}.imageKey`}
        render={({ field }) => (
          <MediaPickerModal
            category="content"
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            selectedUrls={displayUrl ? [displayUrl] : []}
            onSelect={(urls) => field.onChange(urlToMediaKey(urls[0] ?? ""))}
          />
        )}
      />
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function GalleryFormLayout({
  pageTitle,
  defaultValues,
  isPending,
  showKeyField = false,
  ItemCard = GalleryItemCard,
  onDiscard,
  onSubmit,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<GalleryFormValues>({
    defaultValues: {
      key: "",
      name: "",
      note: "",
      isPublic: false,
      items: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: "items" });

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, overIndex: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== overIndex) {
        move(dragIndex, overIndex);
        setDragIndex(overIndex);
      }
    },
    [dragIndex, move]
  );

  function handleAddImages(urls: string[]) {
    for (const url of urls) {
      append({ imageKey: urlToMediaKey(url), name: "", note: "", link: "" });
    }
  }

  const doSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (!applyValidationErrors(err, setError)) {
        throw err;
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const busy = isPending || isSubmitting;

  return (
    <div className="flex min-h-0 flex-col bg-muted/30">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" type="button" className="-ml-2 gap-1.5" onClick={onDiscard}>
          <ArrowLeftIcon className="size-4" />
          Galleries
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" type="button" disabled={busy} onClick={doSubmit}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-3xl p-6 flex flex-col gap-6">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {showKeyField && (
                <Field>
                  <FieldLabel>Key *</FieldLabel>
                  <Input
                    {...register("key", { required: "Key is required" })}
                    placeholder="e.g. homepage-banner"
                  />
                  {errors.key && <FieldError>{errors.key.message}</FieldError>}
                  <p className="text-xs text-muted-foreground">Unique slug used by the public view URL.</p>
                </Field>
              )}
              <Field>
                <FieldLabel>Name *</FieldLabel>
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder="Gallery name"
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel>Note</FieldLabel>
                <Textarea {...register("note")} placeholder="Internal note" rows={2} />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>Public</FieldLabel>
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(dragIndex === index && "opacity-50")}
                >
                  <ItemCard
                    index={index}
                    control={control}
                    register={register}
                    onRemove={() => remove(index)}
                  />
                </div>
              ))}

              {/* Add box */}
              <button
                type="button"
                onClick={() => setAddPickerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 py-6 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
              >
                <PlusIcon className="size-4" />
                Add images
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-image picker for adding new items */}
      <MediaPickerModal
        category="content"
        open={addPickerOpen}
        onOpenChange={setAddPickerOpen}
        selectedUrls={[]}
        multiple
        onSelect={handleAddImages}
      />
    </div>
  );
}
