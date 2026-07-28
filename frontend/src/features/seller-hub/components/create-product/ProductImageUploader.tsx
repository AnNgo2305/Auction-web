import { MAX_PRODUCT_IMAGES } from '@/shared/types/product';
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Upload, X, Star } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/shared/ui/attachment';
import { formatFileSize } from '@/shared/utils/format-size';
import { uploadToS3 } from '@/shared/utils/upload-files-s3';
import { UPLOAD_PURPOSES } from '@/shared/types/upload.ts';

export interface ProductImageItem {
  // Unique key for tracking image in UI
  id: string;

  // Image URL for preview (local blob URL or S3 URL)
  url: string;

  // Original file selected from user's device (new images only)
  sourceFile?: File;

  // AWS S3 key, available after upload or from existing images
  imageKey?: string;

  // Local file metadata shown in attachment preview for newly added images
  originalName?: string;
  size?: number;

  // Current upload status
  status: 'uploading' | 'done' | 'error';

  // Upload failure reason
  errorMessage?: string;

  // Whether this image is a local upload created in current form session
  isNew?: boolean;

  // Primary Image
  isPrimary?: boolean;
}

interface ProductImagesUploaderProps {
  productImages: ProductImageItem[];
  onProductImagesChange: (
    value: (prev: ProductImageItem[]) => ProductImageItem[],
  ) => void;

  max?: number;
}

export function ProductImagesUploader({
  productImages,
  onProductImagesChange,
  max = MAX_PRODUCT_IMAGES,
}: ProductImagesUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const productImagesRef = useRef<ProductImageItem[]>(productImages);

  const handleOpenUploadImage = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    productImagesRef.current = productImages;
  }, [productImages]);

  useEffect(() => {
    return () => {
      productImagesRef.current.forEach((image) => {
        if (image.isNew) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  const handleSetPrimaryImage = (imageId: string) => {
    onProductImagesChange((prev) =>
      prev.map((image) => ({
        ...image,
        isPrimary: image.id === imageId,
      })),
    );
  };

  const handleSelectImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    const remaining = max - productImages.length;
    const selectedFiles = Array.from(files).slice(0, remaining);

    const pendingImages: ProductImageItem[] = selectedFiles.map(
      (file, index) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        sourceFile: file,
        originalName: file.name,
        size: file.size,
        status: 'uploading',
        isNew: true,
        isPrimary: productImages.length === 0 && index === 0,
      }),
    );

    // show uploading state immediately
    onProductImagesChange((prev) => [...prev, ...pendingImages]);

    try {
      setIsUploading(true);

      const uploadedFiles = await uploadToS3(
        selectedFiles,
        UPLOAD_PURPOSES.PRODUCT_IMAGE,
      );

      const updatedPendingImages = pendingImages.map((image, index) => {
        const uploaded = uploadedFiles[index];

        if (!uploaded || !uploaded.exists) {
          return {
            ...image,
            status: 'error' as const,
            errorMessage: 'Upload failed',
          };
        }

        return {
          ...image,
          imageKey: uploaded.key,
          sourceFile: undefined,
          status: 'done' as const,
        };
      });

      onProductImagesChange((prev) => {
        return prev.map((image) => {
          const updated = updatedPendingImages.find(
            (item) => item.id === image.id,
          );
          return updated ?? image;
        });
      });
    } catch {
      const failedImages = pendingImages.map((image) => ({
        ...image,
        status: 'error' as const,
        errorMessage: 'Upload failed',
      }));

      onProductImagesChange((prev) => {
        return prev.map((image) => {
          const failed = failedImages.find((item) => item.id === image.id);

          return failed ?? image;
        });
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (imageId: string) => {
    if (productImages.length <= 1) {
      return;
    }

    const removedImage = productImages.find((image) => image.id === imageId);

    if (removedImage?.isNew) {
      URL.revokeObjectURL(removedImage.url);
    }

    onProductImagesChange((prev) => {
      const remaining = prev.filter((image) => image.id !== imageId);

      if (removedImage?.isPrimary && remaining.length > 0) {
        remaining[0]!.isPrimary = true;
      }

      return remaining;
    });
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleSelectImages}
      />

      {/* Upload box */}
      <div className="px-2 py-6 text-center">
        <Upload className="text-muted-foreground mx-auto mb-6 h-14 w-14" />
        <h3 className="text-base font-semibold">Upload product images</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Drag and drop your images here or choose from your device
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={handleOpenUploadImage}
          disabled={isUploading || productImages.length >= max}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <p className="text-muted-foreground mt-3 text-xs">
          You can upload up to {max} images
        </p>
      </div>

      {/* Attachment List */}
      {productImages.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Uploaded images</h3>
            <p className="text-muted-foreground text-sm">
              {productImages.length} / {max} images uploaded
            </p>
          </div>

          <AttachmentGroup>
            {productImages.map((image) => (
              <Attachment
                key={image.id}
                orientation="vertical"
                size="sm"
                state={image.status}
              >
                <AttachmentMedia variant="image">
                  <img
                    src={image.url}
                    alt={image.originalName ?? 'Product image'}
                    className="object-cover"
                  />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>
                    {image.originalName ?? 'Product image'}
                    {image.isPrimary && (
                      <span className="ml-2 text-xs text-yellow-600">
                        Primary
                      </span>
                    )}
                  </AttachmentTitle>
                  <AttachmentDescription>
                    {image.status === 'uploading' && 'Uploading...'}
                    {image.status === 'done' &&
                      image.size &&
                      formatFileSize(image.size)}
                    {image.status === 'error' &&
                      (image.errorMessage ?? 'Upload failed')}
                  </AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction
                    aria-label="Set primary image"
                    disabled={image.status !== 'done'}
                    onClick={() => handleSetPrimaryImage(image.id)}
                  >
                    <Star
                      className={
                        image.isPrimary ? 'fill-yellow-400 text-yellow-400' : ''
                      }
                    />
                  </AttachmentAction>
                  <AttachmentAction
                    disabled={
                      image.status === 'uploading' || productImages.length <= 1
                    }
                    aria-label={`Remove ${image.originalName}`}
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <X />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            ))}
          </AttachmentGroup>
        </div>
      )}
    </div>
  );
}
