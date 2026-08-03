import type { ProductDocumentItem } from '@/features/seller-hub/components/create-product/ProductDocumentUploader';
import { Button } from '@/shared/ui/button';
import { Download, FileText, Loader2, Pencil, Save, Trash2, Upload, X } from 'lucide-react';
import { Separator } from '@/shared/ui/separator'
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
import { Checkbox } from '@/shared/ui/checkbox';
import React, { useEffect, useRef, useState } from 'react';
import { formatFileSize } from '@/shared/utils/format-size';
import { MAX_PRODUCT_DOCUMENTS } from '@/shared/types/product';
import { useDeleteProductDocument } from '@/features/product/hooks/product-document/useDeleteProductDocument';
import { useDeleteProductDocuments } from '@/features/product/hooks/product-document/useDeleteProductDocuments';
import { useUpdateProductDocuments } from '@/features/product/hooks/product-document/useUpdateProductDocuments';
import { toast } from 'sonner';
import { uploadToS3 } from '@/shared/utils/upload-files-s3';
import { UPLOAD_PURPOSES } from '@/shared/types/upload';
import { Skeleton } from '@/shared/ui/skeleton.tsx';

type ProductDocumentProps = {
  productId: string;
  documents: ProductDocumentItem[];
  isOwner: boolean;
  isEditing: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onEnterEditMode?: () => void;
  onExitEditMode?: () => void;
};

export function ProductDocument({
  productId,
  documents,
  isOwner,
  isEditing,
  isSaving = false,
  isLoading = false,
  onEnterEditMode,
  onExitEditMode,
}: ProductDocumentProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localDocuments, setLocalDocuments] =
    useState<ProductDocumentItem[]>(documents);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalDocuments(documents);
    setSelectedIds((current) =>
      current.filter((id) => documents.some((document) => document.id === id)),
    );
  }, [documents]);

  const deleteProductDocumentMutation = useDeleteProductDocument(productId);
  const deleteProductDocumentsMutation = useDeleteProductDocuments(productId);
  const updateProductDocumentsMutation = useUpdateProductDocuments(productId);

  const handleSave = () => {
    updateProductDocumentsMutation.mutate(
      {
        documents: localDocuments.map((document) => ({
          documentName: document.originalName!,
          documentKey: document.documentKey!,
        })),
      },
      {
        onSuccess: () => {
          setSelectedIds([]);
          onExitEditMode?.();
        },
      },
    );
  };

  const handleCancel = () => {
    setLocalDocuments(documents);
    setSelectedIds([]);
    onExitEditMode?.();
  };

  const handleDeleteDocument = (documentId: string) => {
    console.log('delete id:', documentId);
    console.table(localDocuments);
    const document = localDocuments.find((item) => item.id === documentId);
    if (!document) return;

    if (document.isNew) {
      setLocalDocuments((current) =>
        current.filter((item) => item.id !== documentId),
      );
      setSelectedIds((current) => current.filter((id) => id !== documentId));
      return;
    }

    deleteProductDocumentMutation.mutate(
      { documentId },
      {
        onSuccess: () => {
          setLocalDocuments((current) =>
            current.filter((document) => document.id !== documentId),
          );
          setSelectedIds((current) =>
            current.filter((id) => id !== documentId),
          );
        },
      },
    );
  };

  const handleDeleteSelectedDocuments = () => {
    if (selectedIds.length === 0) return;

    const selectedDocuments = localDocuments.filter((document) =>
      selectedIds.includes(document.id),
    );

    const newDocumentIds = selectedDocuments
      .filter((document) => document.isNew)
      .map((document) => document.id);

    const existingDocumentIds = selectedDocuments
      .filter((document) => !document.isNew)
      .map((document) => document.id);

    if (newDocumentIds.length > 0) {
      setLocalDocuments((current) =>
        current.filter((document) => !newDocumentIds.includes(document.id)),
      );
    }

    if (existingDocumentIds.length === 0) {
      setSelectedIds([]);
      return;
    }

    deleteProductDocumentsMutation.mutate(
      { documentIds: existingDocumentIds },
      {
        onSuccess: () => {
          setLocalDocuments((current) =>
            current.filter(
              (document) => !existingDocumentIds.includes(document.id),
            ),
          );

          setSelectedIds([]);
        },
      },
    );
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const availableSlots = MAX_PRODUCT_DOCUMENTS - localDocuments.length;
    const filesToUpload = files.slice(0, availableSlots);

    if (filesToUpload.length < files.length) {
      toast.warning(`Only ${availableSlots} more document(s) can be added.`);
    }

    const uploadingDocuments: ProductDocumentItem[] = filesToUpload.map(
      (file) => ({
        id: crypto.randomUUID(),
        url: '',
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        status: 'uploading',
        isNew: true,
      }),
    );

    setLocalDocuments((current) => [...current, ...uploadingDocuments]);

    try {
      const uploadedFiles = await uploadToS3(
        filesToUpload,
        UPLOAD_PURPOSES.PRODUCT_DOCUMENT,
      );

      setLocalDocuments((current) =>
        current.map((document) => {
          const index = uploadingDocuments.findIndex(
            (item) => item.id === document.id,
          );

          if (index === -1) return document;
          const uploaded = uploadedFiles[index];

          return {
            ...document,
            status: 'done',
            url: uploaded?.url || '',
            documentKey: uploaded?.key || '',
          };
        }),
      );
    } catch {
      setLocalDocuments((current) =>
        current.map((document) =>
          uploadingDocuments.some((item) => item.id === document.id)
            ? {
                ...document,
                status: 'error',
                errorMessage: 'Upload failed',
              }
            : document,
        ),
      );

      toast.error('Failed to upload document(s).');
    } finally {
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background rounded-xl border shadow-sm">
        <div className="flex items-center justify-between p-6">
          <Skeleton className="h-7 w-44" />
          {isOwner && <Skeleton className="h-10 w-24 rounded-md" />}
        </div>
        <Separator />
        <div className="space-y-4 p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="size-9 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-semibold">Product Documents</h3>
        </div>
        {isOwner &&
          (isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={handleCancel}
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>
              <Button disabled={isSaving} onClick={handleSave}>
                <Save className="mr-2 size-4" />
                Save
              </Button>
            </div>
          ) : (
            <Button onClick={onEnterEditMode}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
          ))}
      </div>
      <Separator />
      <div className="space-y-6 p-6">
        {isEditing && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {selectedIds.length > 0
                  ? `${selectedIds.length} selected`
                  : 'Select documents to remove'}
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={selectedIds.length === 0}
                onClick={handleDeleteSelectedDocuments}
              >
                <Trash2 className="mr-2 size-4" />
                Remove Selected
              </Button>
            </div>
            <Separator />
          </>
        )}
        <AttachmentGroup className="grid grid-cols-2 gap-3">
          {localDocuments.map((document) => (
            <Attachment key={document.id}>
              {isEditing && (
                <Checkbox
                  checked={selectedIds.includes(document.id)}
                  onCheckedChange={(checked) =>
                    setSelectedIds((current) =>
                      checked
                        ? [...current, document.id]
                        : current.filter((id) => id !== document.id),
                    )
                  }
                />
              )}
              <AttachmentMedia>
                {document.status === 'uploading' ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <FileText className="size-5" />
                )}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>
                  {document.originalName ?? 'Untitled document'}
                </AttachmentTitle>
                {document.size && (
                  <AttachmentDescription>
                    {formatFileSize(document.size)}
                  </AttachmentDescription>
                )}
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="size-4" />
                    </a>
                  </Button>
                </AttachmentAction>
                {isEditing && (
                  <AttachmentAction asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </AttachmentAction>
                )}
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>
        {isEditing && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={
                  localDocuments.length >= MAX_PRODUCT_DOCUMENTS || isSaving
                }
              >
                <Upload className="mr-2 size-4" />
                Add Document
              </Button>
            </div>
            <input
              ref={inputRef}
              hidden
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              type="file"
              onChange={handleUpload}
            />
          </>
        )}
      </div>
    </div>
  );
}

