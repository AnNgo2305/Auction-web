import { formatFileSize } from '@/shared/utils/format-size';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/shared/ui/attachment.tsx';
import { FileText, X } from 'lucide-react';

export type MessageAttachmentItem = {
  // Unique key for tracking document in UI
  id: string;

  // URL returned after successful upload
  url: string;

  // AWS S3 key, available after upload
  attachmentKey?: string;

  // File metadata shown in attachment preview
  originalName?: string;
  size?: number;
  mimeType?: string;

  // Current upload status
  status: 'uploading' | 'done' | 'error';

  // Upload failure reason
  errorMessage?: string;
};

export type MessageAttachmentProps = {
  attachments: MessageAttachmentItem[];
  onRemove: (id: string) => void;
};

export function MessageAttachment({ attachments, onRemove }: MessageAttachmentProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <AttachmentGroup className="flex w-full gap-2 overflow-x-auto px-1 py-1">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType?.startsWith('image/');
        return (
          <Attachment
            key={attachment.id}
            orientation="vertical"
            size="sm"
            state={attachment.status}
            className="w-24 shrink-0"
          >
            <AttachmentMedia variant={isImage ? 'image' : 'icon'}>
              {isImage && attachment.url ? (
                <img
                  src={attachment.url}
                  alt={attachment.originalName ?? 'Image'}
                />
              ) : (
                <FileText className="h-6 w-6" />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>
                {attachment.originalName ?? 'Attachment'}
              </AttachmentTitle>
              <AttachmentDescription>
                {attachment.status === 'uploading' && 'Uploading...'}
                {attachment.status === 'done' &&
                  attachment.size !== undefined &&
                  formatFileSize(attachment.size)}
                {attachment.status === 'error' &&
                  (attachment.errorMessage ?? 'Upload failed')}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                type="button"
                disabled={attachment.status === 'uploading'}
                aria-label={`Remove ${attachment.originalName ?? 'attachment'}`}
                onClick={() => onRemove(attachment.id)}
              >
                <X />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        );
      })}
      </AttachmentGroup>
    );
}
