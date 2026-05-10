import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useContentClient } from "@/components/containers/api-client-provider";
import { AdminErrorState } from "@/components/admin/admin-page";
import { Skeleton } from "@/components/ui/skeleton";
import { urlToMediaKey } from "@/lib/media";
import { ROUTES } from "@/configs/routes";

import type { GalleryFormValues } from "./components/GalleryFormLayout";
import { GalleryFormLayout } from "./components/GalleryFormLayout";

export default function EditGalleryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const galleryId = Number(id);

  const { data: gallery, isLoading, isError } = useQuery({
    queryKey: ["admin-gallery", galleryId],
    queryFn: () => contentClient.getAdminGalleryById(galleryId),
    enabled: !!galleryId,
  });

  const { mutateAsync: updateGallery, isPending } = useMutation({
    mutationFn: (input: Parameters<typeof contentClient.updateGallery>[1]) =>
      contentClient.updateGallery(galleryId, input),
  });

  const handleSubmit = async (values: GalleryFormValues) => {
    await updateGallery({
      name: values.name,
      note: values.note || undefined,
      isPublic: values.isPublic,
      items: values.items.map((item, i) => ({
        imageKey: item.imageKey,
        displayOrder: i + 1,
        name: item.name || undefined,
        note: item.note || undefined,
        link: item.link || undefined,
      })),
    });
    toast.success("Gallery saved");
    await queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-gallery", galleryId] });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !gallery) {
    return (
      <div className="p-6">
        <AdminErrorState
          title="Gallery not found"
          description="This gallery could not be loaded. It may have been deleted."
        />
      </div>
    );
  }

  const defaultValues: GalleryFormValues = {
    key: gallery.key,
    name: gallery.name,
    note: gallery.note ?? "",
    isPublic: gallery.isPublic,
    items: [...gallery.items]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({
        imageKey: urlToMediaKey(item.imageKey),
        name: item.name ?? "",
        note: item.note ?? "",
        link: item.link ?? "",
      })),
  };

  return (
    <GalleryFormLayout
      pageTitle={gallery.name}
      defaultValues={defaultValues}
      isPending={isPending}
      onDiscard={() => navigate(ROUTES.contentGalleries)}
      onSubmit={handleSubmit}
    />
  );
}
