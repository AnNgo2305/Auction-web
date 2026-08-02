import type { ProductImageItem } from '@/features/seller-hub/components/create-product/ProductImageUploader';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Loader2, Save, Trash2, X, Star, Plus } from 'lucide-react';
import { MAX_PRODUCT_IMAGES } from '@/shared/types/product.ts';
import React, { useEffect, useRef, useState } from 'react';
import { useDeleteProductImage } from '@/features/product/hooks/product-image/useDeleteProductImage';
import { useDeleteProductImages } from '@/features/product/hooks/product-image/useDeleteProductImages';
import { useUpdateProductImages } from '@/features/product/hooks/product-image/useUpdateProductImages';
import { useSetPrimaryProductImage } from '@/features/product/hooks/product-image/useSetMainProductImage';
import { toast } from 'sonner';
import { UPLOAD_PURPOSES } from '@/shared/types/upload.ts';
import { uploadToS3 } from '@/shared/utils/upload-files-s3.ts';

type ProductImageEditorProps = {
  productId: string;
  images: ProductImageItem[];
  onExitEditMode?: () => void;
};

export function ProductImageEditor({
  productId,
  images,
  onExitEditMode,
}: ProductImageEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<ProductImageItem[]>(images);
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const deleteProductImageMutation = useDeleteProductImage(productId);
  const deleteProductImagesMutation = useDeleteProductImages(productId);
  const updateProductImagesMutation = useUpdateProductImages(productId);
  const setPrimaryProductImageMutation = useSetPrimaryProductImage(productId);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const availableSlots = MAX_PRODUCT_IMAGES - localImages.length;
    const filesToUpload = files.slice(0, availableSlots);

    if (filesToUpload.length < files.length) {
      toast.warning(`Only ${availableSlots} more image(s) can be added.`);
    }

    const uploadingImages: ProductImageItem[] = filesToUpload.map((file) => ({
      id: crypto.randomUUID(),
      imageUrl: '',
      originalName: file.name,
      status: 'uploading',
      isPrimary: false,
      isNew: true,
    }));

    setLocalImages((current) => [...current, ...uploadingImages]);

    try {
      const uploadedFiles = await uploadToS3(
        filesToUpload,
        UPLOAD_PURPOSES.PRODUCT_IMAGE,
      );

      setLocalImages((current) =>
        current.map((image) => {
          const index = uploadingImages.findIndex(
            (item) => item.id === image.id,
          );

          if (index === -1) return image;

          const uploaded = uploadedFiles[index];

          return {
            ...image,
            status: 'done',
            imageUrl: uploaded?.url ?? '',
            imageKey: uploaded?.key ?? '',
          };
        }),
      );
    } catch {
      setLocalImages((current) =>
        current.map((image) =>
          uploadingImages.some((item) => item.id === image.id)
            ? {
              ...image,
              status: 'error',
              errorMessage: 'Upload failed',
            }
            : image,
        ),
      );

      toast.error('Failed to upload image(s).');
    } finally {
      event.target.value = '';
    }
  };

  const handleDeleteImage = (image: ProductImageItem) => {
    if (image.isNew) {
      setLocalImages((current) =>
        current.filter((item) => item.id !== image.id),
      );
      setSelectedIds((current) => current.filter((id) => id !== image.id));
      return;
    }

    deleteProductImageMutation.mutate(
      { imageId: image.id },
      {
        onSuccess: () => {
          setLocalImages((current) =>
            current.filter((item) => item.id !== image.id),
          );
          setSelectedIds((current) => current.filter((id) => id !== image.id));
        },
      },
    );
  };

  const handleDeleteSelectedImages = () => {
    if (selectedIds.length === 0) return;
    const selectedImages = localImages.filter((image) =>
      selectedIds.includes(image.id),
    );

    const existingImageIds = selectedImages
      .filter((image) => !image.isNew)
      .map((image) => image.id);

    const newImageIds = selectedImages
      .filter((image) => image.isNew)
      .map((image) => image.id);

    if (newImageIds.length > 0) {
      setLocalImages((current) =>
        current.filter((image) => !newImageIds.includes(image.id)),
      );
      setSelectedIds((current) =>
        current.filter((id) => !newImageIds.includes(id)),
      );
    }

    if (existingImageIds.length > 0) {
      deleteProductImagesMutation.mutate(
        { imageIds: existingImageIds },
        {
          onSuccess: () => {
            setLocalImages((current) =>
              current.filter((image) => !existingImageIds.includes(image.id)),
            );

            setSelectedIds((current) =>
              current.filter((id) => !existingImageIds.includes(id)),
            );
          },
        },
      );
    }
  };

  const handleSave = () => {
    updateProductImagesMutation.mutate(
      {
        images: localImages.map((image) => ({
          imageKey: image.imageKey!,
          isPrimary: image.isPrimary!,
        })),
      },
      {
        onSuccess: () => {
          onExitEditMode?.();
        },
      },
    );
  }

  const handleCancel = () => {
    setLocalImages(images);
    setSelectedIds([]);
    onExitEditMode?.();
  }

  const handleSetPrimary = (imageId: string) => {
    setPrimaryProductImageMutation.mutate(
      { imageId },
      {
        onSuccess: () => {
          setLocalImages((current) =>
            current.map((image) => ({
              ...image,
              isPrimary: image.id === imageId,
            })),
          );
        },
      },
    );
  }

  return (
    <div className="bg-background rounded-xl border p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={updateProductImagesMutation.isPending}
            onClick={handleCancel}
          >
            <X className="mr-2 size-4" />
            Cancel
          </Button>
          <Button
            disabled={updateProductImagesMutation.isPending}
            onClick={handleSave}
          >
            <Save className="mr-2 size-4" />
            Save
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <>
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSelectedImages}
                disabled={updateProductImagesMutation.isPending}
                className="text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Remove Selected
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {localImages.map((image) => {
          const selected = selectedIds.includes(image.id);
          return (
            <div
              key={image.id}
              className="group bg-muted relative overflow-hidden rounded-xl border"
            >
              <div className="aspect-square">
                {image.status === 'uploading' ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <Loader2 className="size-8 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Uploading...
                    </span>
                  </div>
                ) : (
                  <img
                    src={image.imageUrl}
                    alt={image.originalName ?? 'Product image'}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              {image.status !== 'uploading' && (
                <>
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) =>
                        setSelectedIds((current) =>
                          checked
                            ? [...current, image.id]
                            : current.filter((id) => id !== image.id),
                        )
                      }
                      className="bg-white/90"
                    />
                    {image.isPrimary && (
                      <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                        <Star className="size-3 fill-current" />
                        Primary
                      </span>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 size-8 bg-white/90 opacity-0 transition group-hover:opacity-100 hover:bg-white"
                    onClick={() => handleDeleteImage(image)}
                  >
                    <Trash2 className="text-destructive size-4" />
                  </Button>
                </>
              )}
              {!image.isPrimary && image.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image.id)}
                  className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  Set Primary
                </button>
              )}
            </div>
          );
        })}
        {localImages.length < MAX_PRODUCT_IMAGES && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="text-muted-foreground hover:bg-muted flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition"
            >
              <Plus className="size-8" />
              <span className="text-sm">Add Images</span>
            </Button>
            <input
              ref={inputRef}
              hidden
              multiple
              accept="image/*"
              type="file"
              onChange={handleUpload}
              disabled={updateProductImagesMutation.isPending}
            />
          </>
        )}
      </div>
    </div>
  );
}
