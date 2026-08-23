import React, { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';

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
import { UPLOAD_PURPOSES } from '@/shared/types/upload';
import { MAX_PRODUCT_DOCUMENTS } from '@/shared/types/product.ts';

export interface ProductDocumentItem {
  // Unique key for tracking document in UI
  id: string;

  // Document URL for preview or download
  url: string;

  // AWS S3 key, available after upload or from existing documents
  documentKey?: string;

  // File metadata shown in attachment preview
  originalName?: string;
  size?: number;
  mimeType?: string;

  // Current upload status
  status: 'uploading' | 'done' | 'error';

  // Upload failure reason
  errorMessage?: string;

  // New Document
  isNew: boolean;
}

interface ProductDocumentsUploaderProps {
  documents: ProductDocumentItem[];

  onProductDocumentsChange: (
    value: (prev: ProductDocumentItem[]) => ProductDocumentItem[],
  ) => void;

  max?: number;
}

export function ProductDocumentsUploader({
  documents,
  onProductDocumentsChange,
  max = MAX_PRODUCT_DOCUMENTS,
}: ProductDocumentsUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenUploadDocument = () => {
    inputRef.current?.click();
  };

  const handleSelectDocuments = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    const remaining = max - documents.length;

    const selectedFiles = Array.from(files).slice(0, remaining);

    const pendingDocuments: ProductDocumentItem[] = selectedFiles.map(
      (file) => ({
        id: crypto.randomUUID(),

        // temporary blob url for UI
        url: URL.createObjectURL(file),

        originalName: file.name,
        size: file.size,
        mimeType: file.type,

        isNew: true,
        status: 'uploading',
      }),
    );

    // Show uploading state immediately
    onProductDocumentsChange((prev) => [...prev, ...pendingDocuments]);

    try {
      setIsUploading(true);

      const uploadedFiles = await uploadToS3(
        selectedFiles,
        UPLOAD_PURPOSES.PRODUCT_DOCUMENT,
      );

      const updatedPendingDocuments = pendingDocuments.map(
        (document, index) => {
          const uploaded = uploadedFiles[index];

          if (!uploaded?.exists) {
            return {
              ...document,
              status: 'error' as const,
              errorMessage: 'Upload failed',
            };
          }

          return {
            ...document,
            url: uploaded.url ?? '',
            documentKey: uploaded.key || '',
            status: 'done' as const,
          };
        },
      );

      onProductDocumentsChange((prev) =>
        prev.map((document) => {
          const updated = updatedPendingDocuments.find(
            (item) => item.id === document.id,
          );

          return updated ?? document;
        }),
      );
    } catch {
      const failedDocuments = pendingDocuments.map((document) => ({
        ...document,
        status: 'error' as const,
        errorMessage: 'Upload failed',
      }));

      onProductDocumentsChange((prev) =>
        prev.map((document) => {
          const failed = failedDocuments.find(
            (item) => item.id === document.id,
          );

          return failed ?? document;
        }),
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveDocument = (id: string) => {
    onProductDocumentsChange((prev) =>
      prev.filter((document) => document.id !== id),
    );
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        multiple
        hidden
        onChange={(event) => {
          void handleSelectDocuments(event);
        }}
      />

      {/* Upload box */}
      <div className="px-2 py-6 text-center">
        <Upload className="text-muted-foreground mx-auto mb-6 h-14 w-14" />

        <h3 className="text-base font-semibold">Upload documents</h3>

        <p className="text-muted-foreground mt-2 text-sm">
          Upload your product related documents from your device
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={handleOpenUploadDocument}
          disabled={isUploading || documents.length >= max}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>

        <p className="text-muted-foreground mt-3 text-xs">
          You can upload up to {max} documents
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Uploaded documents</h3>

          <p className="text-muted-foreground text-sm">
            {documents.length} / {max} documents uploaded
          </p>
        </div>

        <AttachmentGroup className="flex w-full flex-col gap-2">
          {documents.map((document) => (
            <Attachment
              key={document.id}
              className="w-full"
              orientation="horizontal"
              size="sm"
              state={document.status}
            >
              <AttachmentMedia>
                <FileText className="h-8 w-8" />
              </AttachmentMedia>

              <AttachmentContent>
                <AttachmentTitle>
                  {document.originalName ?? 'Document'}
                </AttachmentTitle>

                <AttachmentDescription>
                  {document.status === 'uploading' && 'Uploading...'}

                  {document.status === 'done' &&
                    document.size &&
                    formatFileSize(document.size)}

                  {document.status === 'error' &&
                    (document.errorMessage ?? 'Upload failed')}
                </AttachmentDescription>
              </AttachmentContent>

              <AttachmentActions>
                <AttachmentAction
                  disabled={document.status === 'uploading'}
                  aria-label={`Remove ${document.originalName ?? 'document'}`}
                  onClick={() => handleRemoveDocument(document.id)}
                >
                  <X />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>
      </div>
    </div>
  );
}
