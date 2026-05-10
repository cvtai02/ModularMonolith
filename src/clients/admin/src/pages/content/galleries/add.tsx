import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useContentClient } from "@/components/containers/api-client-provider";
import { ROUTES } from "@/configs/routes";

import type { GalleryFormValues } from "./components/GalleryFormLayout";
import { GalleryFormLayout } from "./components/GalleryFormLayout";

export default function AddGalleryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const contentClient = useContentClient();

  const { mutateAsync: createGallery, isPending } = useMutation({
    mutationFn: contentClient.createGallery.bind(contentClient),
  });

  const handleSubmit = async (values: GalleryFormValues) => {
    const result = await createGallery({
      key: values.key,
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
    toast.success("Gallery created");
    await queryClient.invalidateQueries({ queryKey: ["admin-galleries"] });
    navigate(ROUTES.contentGalleryEdit(result.id));
  };

  return (
    <GalleryFormLayout
      pageTitle="New gallery"
      isPending={isPending}
      showKeyField
      onDiscard={() => navigate(ROUTES.contentGalleries)}
      onSubmit={handleSubmit}
    />
  );
}
