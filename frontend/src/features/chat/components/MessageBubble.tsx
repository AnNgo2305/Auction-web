import { MessageData } from '@/features/chat/types/message/message.ts';
import { cn } from '@/shared/lib/utils.ts';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { Bubble, BubbleContent, BubbleGroup } from '@/shared/ui/bubble';
import {
  ImageIcon,
  Paperclip,
  MoreHorizontal,
  Pencil,
  Trash2,
  Reply,
} from 'lucide-react';
import {
  computeMessageStatus,
  STATUS_LABEL,
} from '@/features/chat/utils/message-status';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { formatFileSize } from '@/shared/utils/format-size';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import { useChatStore } from '@/shared/stores/chat.store';
import { useEffect } from 'react';

export type MessageBubbleProps = {
  message: MessageData;
  showAvatar: boolean;
  isLastOwnMessage: boolean;
  isMine: boolean;
  peerLastReadAt: string | null;
  isPeerOnline: boolean;
  downloadUrls: Record<string, string>;

  onEditRequest?: (messageId: string) => void;
  onDeleteRequest?: (messageId: string) => void;
  onReplyRequest: (messageId: string) => void;
};

export function MessageBubble({
  message,
  showAvatar,
  isLastOwnMessage,
  onReplyRequest,
  onDeleteRequest,
  onEditRequest,
  isMine,
  peerLastReadAt,
  isPeerOnline,
  downloadUrls,
}: MessageBubbleProps) {
  const { setPeerReadAt } = useChatStore();

  useEffect(() => {
    if (!isMine || !isLastOwnMessage) {
      return;
    }

    if (peerLastReadAt !== null) {
      return;
    }

    if (!message.readAt) {
      return;
    }

    setPeerReadAt(message.conversationId, message.readAt);
  }, [
    isMine,
    isLastOwnMessage,
    peerLastReadAt,
    message.conversationId,
    message.readAt,
    setPeerReadAt,
  ]);

  const time = new Date(message.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const messageStatus =
    isMine && isLastOwnMessage
      ? computeMessageStatus({ message, peerLastReadAt, isPeerOnline })
      : null;

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isMine ? 'justify-end' : 'justify-start',
      )}
    >
      {!isMine && showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={message.sender.profileImageUrl ?? defaultAvatarImageUrl}
            alt={message.sender.username}
          />
          <AvatarFallback>
            {message.sender.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        !isMine && <div className="w-8 shrink-0" />
      )}
      <div className="group flex items-center justify-end gap-1">
        <BubbleGroup>
          <Bubble align={isMine ? 'end' : 'start'}>
            <BubbleContent
              className={cn(
                isMine
                  ? 'bg-blue-primary rounded-br-md text-white'
                  : 'rounded-bl-md bg-gray-100 text-gray-900',
              )}
            >
              {message.replyToMessage && (
                <div
                  className={cn(
                    'mb-1.5 w-full rounded-lg border-l-2 px-2 py-1 text-left text-xs',
                    isMine
                      ? 'border-white/50 bg-white/10 text-white/80'
                      : 'border-gray-300 bg-white text-gray-500',
                  )}
                >
                  <p className="font-medium">
                    {message.replyToMessage.sender.username}
                  </p>
                  {message.replyToMessage.type === 'TEXT' && (
                    <p className="truncate">
                      {message.replyToMessage.content ?? ''}
                    </p>
                  )}
                  {message.replyToMessage.type === 'IMAGE' && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 shrink-0" />
                      <span>Image</span>
                    </div>
                  )}
                  {message.replyToMessage.type === 'FILE' && (
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 shrink-0" />
                      <span>Attachment</span>
                    </div>
                  )}
                </div>
              )}
              {message.type === 'TEXT' && (
                <p className="wrap-break-word whitespace-pre-wrap">
                  {message.content}
                </p>
              )}
              {message.type === 'IMAGE' &&
                message.fileKey &&
                (downloadUrls[message.fileKey] ? (
                  <img
                    src={downloadUrls[message.fileKey]}
                    alt="Image"
                    className="block max-h-80 max-w-60 rounded-lg object-cover"
                    loading="lazy"
                    width={320}
                    height={240}
                  />
                ) : (
                  <div className="flex h-40 w-60 items-center justify-center rounded-lg bg-black/5">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                ))}
              {message.type === 'FILE' &&
                message.fileKey &&
                downloadUrls[message.fileKey] && (
                  <a
                    href={downloadUrls[message.fileKey]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex max-w-60 items-center gap-3 rounded-lg px-3 py-2',
                      isMine
                        ? 'bg-white/10 hover:bg-white/15'
                        : 'bg-white hover:bg-gray-50',
                    )}
                  >
                    <Paperclip className="h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {message.fileName}
                      </p>
                      {message.fileSize && (
                        <p
                          className={cn(
                            'text-xs',
                            isMine ? 'text-white/60' : 'text-gray-400',
                          )}
                        >
                          {formatFileSize(message.fileSize)}
                        </p>
                      )}
                    </div>
                  </a>
                )}
              <div
                className={cn(
                  'mt-1 flex items-center gap-1',
                  isMine ? 'justify-end' : 'justify-start',
                )}
              >
                <span
                  className={cn(
                    'text-[10px]',
                    isMine ? 'text-white/70' : 'text-gray-400',
                  )}
                >
                  {time}
                </span>
              </div>
            </BubbleContent>
          </Bubble>
          {isMine && isLastOwnMessage && messageStatus && (
            <div
              className="mt-0.5 mr-1 flex items-center gap-1 text-[11px] leading-none select-none"
              aria-live="polite"
              role="status"
            >
              <span
                className={cn(
                  messageStatus.status === 'failed'
                    ? 'text-red-500'
                    : 'text-gray-400',
                )}
              >
                {STATUS_LABEL[messageStatus.status]}
                {messageStatus.time && ` at ${messageStatus.time}`}
              </span>

              {messageStatus.isEdited && (
                <span className="text-gray-400 italic">Edited</span>
              )}
            </div>
          )}
        </BubbleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center',
                'rounded-full text-gray-400',
                'opacity-0 transition-opacity',
                'group-hover:opacity-100',
                'hover:bg-gray-100 hover:text-gray-600',
                isMine ? 'order-first' : 'order-last',
              )}
              aria-label="Message actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReplyRequest(message.messageId)}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </DropdownMenuItem>
            {isMine && message.type === 'TEXT' && onEditRequest && (
              <DropdownMenuItem
                onClick={() => onEditRequest(message.messageId)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {isMine && onDeleteRequest && (
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => onDeleteRequest(message.messageId)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
