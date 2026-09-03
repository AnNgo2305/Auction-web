import { MessageData } from '@/features/chat/types/message/message.ts';
import { Button } from '@/shared/ui/button';
import { ImageIcon, Paperclip, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/shared/ui/textarea.tsx';
import { cn } from '@/shared/lib/utils.ts';
import {
  MessageAttachment,
  type MessageAttachmentItem,
} from '@/features/chat/components/MessageAttachment.tsx';
import { uploadToS3 } from '@/shared/utils/upload-files-s3';
import { UPLOAD_PURPOSES } from '@/shared/types/upload';
import type { MessageInputSendData } from '@/features/chat/hooks/message/useSendMessage';
import { MESSAGE_TYPE } from '@/shared/types/message.ts';

export type MessageInputMode =
  | {
      type: 'idle';
    }
  | {
      type: 'reply';
      message: MessageData;
    }
  | {
      type: 'edit';
      message: MessageData;
    };

export type MessageInputProps = {
  mode: MessageInputMode;
  onSend: (payload: MessageInputSendData) => void;
  onEdit: (messageId: string, content: string) => void;
  onStartTyping: (content: string) => void;
  onStopTyping: () => void;
  onCancelMode: () => void;
  disabled?: boolean;
};

export function MessageInput({
  mode,
  onSend,
  onEdit,
  onStartTyping,
  onStopTyping,
  onCancelMode,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachmentItem[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (mode.type === 'edit') {
      setText(mode.message.content ?? '');
    } else if (mode.type === 'reply') {
      setText('');
    } else {
      setText('');
    }

    inputRef.current?.focus();
  }, [mode]);

  const isEditing = mode.type === 'edit';
  const isReplying = mode.type === 'reply';

  const handleChange = (value: string) => {
    setText(value);

    if (value.trim()) {
      onStartTyping(value);
    } else {
      onStopTyping();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSelectAttachments = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files);

    const pendingAttachments: MessageAttachmentItem[] = selectedFiles.map(
      (file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        status: 'uploading',
      }),
    );

    setAttachments((prev) => [...prev, ...pendingAttachments]);

    try {
      setIsUploading(true);

      const uploadedFiles = await uploadToS3(
        selectedFiles,
        UPLOAD_PURPOSES.CHAT_ATTACHMENT,
      );

      const updatedAttachments = pendingAttachments.map((attachment, index) => {
        const uploaded = uploadedFiles[index];

        if (!uploaded?.exists) {
          return {
            ...attachment,
            status: 'error' as const,
            errorMessage: 'Upload failed',
          };
        }

        return {
          ...attachment,
          url: uploaded.url ?? attachment.url,
          attachmentKey: uploaded.key ?? '',
          status: 'done' as const,
        };
      });

      setAttachments((prev) =>
        prev.map((attachment) => {
          const updated = updatedAttachments.find(
            (item) => item.id === attachment.id,
          );

          return updated ?? attachment;
        }),
      );
    } catch {
      setAttachments((prev) =>
        prev.map((attachment) => {
          const failed = pendingAttachments.find(
            (item) => item.id === attachment.id,
          );

          if (!failed) {
            return attachment;
          }

          return {
            ...attachment,
            status: 'error' as const,
            errorMessage: 'Upload failed',
          };
        }),
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleSend = () => {
    const content = text.trim();
    if (isEditing) {
      if (!content) {
        return;
      }
      onEdit(mode.message.messageId, content);
      inputRef.current?.focus();
      return;
    }

    const hasAttachments = attachments.length > 0;

    if (isUploading || (!content && !hasAttachments)) {
      return;
    }

    if (content) {
      onSend({
        content,
        type: MESSAGE_TYPE.TEXT,
        replyToMessageId: isReplying ? mode.message.messageId : undefined,
      });
    }

    attachments.forEach((attachment) => {
      if (attachment.status !== 'done' || !attachment.attachmentKey) {
        return;
      }

      onSend({
        content: '',
        type: attachment.mimeType?.startsWith('image/')
          ? MESSAGE_TYPE.IMAGE
          : MESSAGE_TYPE.FILE,
        replyToMessageId: isReplying ? mode.message.messageId : undefined,
        attachment: {
          fileKey: attachment.attachmentKey,
          fileName: attachment.originalName,
          mimeType: attachment.mimeType,
          fileSize: attachment.size,
        },
      });
    });

    setText('');
    setAttachments([]);
    if (isReplying) {
      onCancelMode();
    }
    onStopTyping();
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200">
      {isEditing && (
        <div className="border-blue-primary mb-3 flex items-center gap-2 rounded-lg border-l-2 bg-gray-50 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600">Editing message</p>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {mode.message.content}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={onCancelMode}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {isReplying && (
        <div className="border-blue-primary mb-3 flex items-start gap-2 rounded-lg border-l-2 bg-gray-50 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600">
              Replying to {mode.message.sender.username}
            </p>
            {mode.message.type === MESSAGE_TYPE.TEXT && (
              <p className="mt-0.5 truncate text-sm text-gray-500">
                {mode.message.content}
              </p>
            )}
            {mode.message.type === MESSAGE_TYPE.IMAGE && (
              <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span>Image</span>
              </div>
            )}
            {mode.message.type === MESSAGE_TYPE.FILE && (
              <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                <Paperclip className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {mode.message.fileName ?? 'Attachment'}
                </span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-gray-400 hover:text-gray-600"
            onClick={onCancelMode}
          >
            <X />
          </Button>
        </div>
      )}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || isEditing}
            onClick={() => imageInputRef.current?.click()}
            className="shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleSelectAttachments(event);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || isEditing}
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            className="hidden"
            onChange={(event) => {
              void handleSelectAttachments(event);
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {attachments.length > 0 && (
              <MessageAttachment
                attachments={attachments}
                onRemove={handleRemoveAttachment}
              />
            )}
            <Textarea
              value={text}
              ref={inputRef}
              disabled={disabled}
              onChange={(event) => handleChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isEditing
                  ? 'Edit message...'
                  : isReplying
                    ? 'Reply to message...'
                    : 'Type a message...'
              }
              rows={1}
              className={cn(
                'max-h-32 min-h-10 flex-1 resize-none',
                'rounded-2xl border border-gray-200',
                'bg-gray-50 px-4 py-2.5 text-sm',
                'outline-none',
                'focus:border-blue-primary focus:ring-blue-primary focus:ring-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
          </div>
          <Button
            type="button"
            size="icon"
            disabled={disabled || (!text.trim() && attachments.length === 0)}
            onClick={handleSend}
            className="shrink-0 rounded-full border border-green-300 bg-white text-green-700 hover:bg-green-100"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
