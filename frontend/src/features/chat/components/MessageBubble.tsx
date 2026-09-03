import { MessageData } from '@/features/chat/types/message/message.ts';
import { cn } from '@/shared/lib/utils.ts';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { Bubble, BubbleContent, BubbleGroup } from '@/shared/ui/bubble';
import {
  ImageIcon,
  Paperclip,
  MoreVertical,
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
import { useUser } from '@/shared/contexts/UserContext.tsx';
import { MESSAGE_TYPE } from '@/shared/types/message.ts';

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
  const { currentUser } = useUser();

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
        <Avatar className="h-8 w-8 shrink-0 -translate-y-0.5">
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
      <div className="flex flex-col items-end">
        <div className="group flex items-center justify-end gap-1">
          <BubbleGroup>
            <Bubble align={isMine ? 'end' : 'start'} variant="custom">
              {message.replyToMessage && (
                <div
                  className={cn(
                    'mx-1 mt-1 -mb-2 px-2 py-1.5',
                    'rounded-t-md rounded-b-none',
                    'text-left text-xs',
                    'bg-gray-100 text-gray-900',
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                    <Reply className="h-3 w-3 shrink-0" />
                    <span>
                      Reply to{' '}
                      <span className="font-medium">
                        {message.replyToMessage.sender.userId ===
                        currentUser?.userId
                          ? 'me'
                          : message.replyToMessage.sender.username}
                      </span>
                    </span>
                  </div>
                  {message.replyToMessage.type === MESSAGE_TYPE.TEXT && (
                    <p className="truncate text-gray-700">
                      {message.replyToMessage.content ?? ''}
                    </p>
                  )}
                  {message.replyToMessage.type === MESSAGE_TYPE.IMAGE && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ImageIcon className="h-4 w-4 shrink-0" />
                      <span>Image</span>
                    </div>
                  )}
                  {message.replyToMessage.type === MESSAGE_TYPE.FILE && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Paperclip className="h-4 w-4 shrink-0" />
                      <span>Attachment</span>
                    </div>
                  )}
                </div>
              )}
              <BubbleContent
                className={cn(
                  'max-w-125 px-2 py-2',
                  message.type === MESSAGE_TYPE.IMAGE ||
                    message.type === MESSAGE_TYPE.FILE
                    ? 'p-0'
                    : isMine
                      ? 'rounded-br-md bg-green-600 text-white'
                      : 'rounded-bl-md bg-gray-100 text-gray-900',
                )}
              >
                {message.type === MESSAGE_TYPE.TEXT && (
                  <p className="wrap-break-word whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
                {message.type === MESSAGE_TYPE.IMAGE &&
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
                {message.type === MESSAGE_TYPE.FILE &&
                  message.fileKey &&
                  downloadUrls[message.fileKey] && (
                    <a
                      href={downloadUrls[message.fileKey]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex max-w-125 items-center gap-3 rounded-xl px-3 py-2.5',
                        'border border-gray-200 bg-gray-200',
                        'transition-colors hover:bg-gray-300',
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {message.fileName}
                        </p>
                        {message.fileSize && (
                          <p className="mt-0.5 text-xs text-gray-700">
                            {formatFileSize(message.fileSize)}
                          </p>
                        )}
                      </div>
                    </a>
                  )}
              </BubbleContent>
              <span
                className={cn(
                  'absolute top-1/2 -translate-y-1/2',
                  'text-[12px] whitespace-nowrap text-gray-700',
                  'opacity-0 transition-opacity duration-150',
                  'group-hover/bubble:opacity-100',
                  isMine ? 'right-full mr-7' : 'left-full ml-7',
                )}
              >
                {time}
              </span>
            </Bubble>
          </BubbleGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center',
                  'rounded-full text-gray-400',
                  'opacity-0 transition-opacity',
                  'group-hover:opacity-100',
                  'hover:bg-gray-100 hover:text-black',
                  isMine ? 'order-first' : 'order-last',
                )}
                aria-label="Message actions"
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onReplyRequest(message.messageId)}
              >
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
              {isMine &&
                message.type === MESSAGE_TYPE.TEXT &&
                onEditRequest && (
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
      </div>
    </div>
  );
}
