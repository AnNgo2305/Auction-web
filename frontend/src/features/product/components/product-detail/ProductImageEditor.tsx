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

  const handleSetPrimary = (image: ProductImageItem) => {
    if (image.isNew) {
      setLocalImages((current) =>
        current.map((item) => ({
          ...item,
          isPrimary: item.id === image.id,
        })),
      );

      return;
    }

    setPrimaryProductImageMutation.mutate(
      { imageId: image.id },
      {
        onSuccess: () => {
          setLocalImages((current) =>
            current.map((item) => ({
              ...item,
              isPrimary: item.id === image.id,
            })),
          );
        },
      },
    );
  };

  return (
    <div className="bg-background rounded-xl border p-6 shadow-sm">
      <div className="mb-6 space-y-4">
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

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm font-medium">
              {selectedIds.length} selected
            </span>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelectedImages}
              disabled={updateProductImagesMutation.isPending}
            >
              <Trash2 className="mr-2 size-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
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
                  <div className="absolute top-2 right-2 left-2 flex items-start justify-between">
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
                      <Star className="size-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 bottom-2 size-8 group-hover:opacity-100"
                    onClick={() => handleDeleteImage(image)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
              {!image.isPrimary && image.status !== 'uploading' && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() => handleSetPrimary(image)}
                  className="absolute bottom-2 left-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Star className="size-4" />
                </Button>
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
              className="group h-full rounded-xl border-2 border-dashed p-0"
            >
              <div className="text-muted-foreground group-hover:bg-muted/50 flex aspect-square w-full flex-col items-center justify-center gap-3 transition-colors">
                <Plus className="size-10" />
                <span className="font-medium">Add Images</span>
              </div>
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
