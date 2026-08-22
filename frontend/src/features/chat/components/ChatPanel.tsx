import React, { useEffect, useState, useMemo } from 'react';
import type { Socket } from 'socket.io-client';
import { MessageInput, type MessageInputMode } from '@/features/chat/components/MessageInput';
import { MessageList } from '@/features/chat/components/MessageList';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useUser } from '@/shared/contexts/UserContext';
import { useChatStore } from '@/shared/stores/chat.store';
import { useDeleteConversation } from '@/features/chat/hooks/conversation/useDeleteConversation';
import { useGetMessages } from '@/features/chat/hooks/message/useGetMessages';
import { useSendMessage } from '@/features/chat/hooks/message/useSendMessage';
import { useDeleteMessage } from '@/features/chat/hooks/message/useDeleteMessage';
import { useUpdateMessage } from '@/features/chat/hooks/message/useUpdateMessage';
import { useReadMessage } from '@/features/chat/hooks/message/useReadMessage';
import { useChatTyping } from '@/features/chat/hooks/useChatTyping';
import { createPresignedDownloadUrl } from '@/shared/api/upload.ts';

type ChatPanelConversation = {
  conversationId: string;
  otherUser: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };
};

type ChatPanelProps = {
  conversation: ChatPanelConversation;
  chatSocketRef: React.RefObject<Socket | null>;
};

export function ChatPanel({ conversation, chatSocketRef }: ChatPanelProps) {
  const {
    setActiveConversation,
    onlineUsers,
    lastSeenMap,
    typingUsers,
    peerReadAt,
    clearTypingForConversation,
  } = useChatStore();
  const [isDeleteConversationDialogOpen, setIsDeleteConversationDialogOpen] =
    useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [messageInputMode, setMessageInputMode] =
    useState<MessageInputMode>({ type: 'idle' });
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});

  const { currentUser } = useUser();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessages(conversation.conversationId);

  const deleteConversation = useDeleteConversation(() => {
    setActiveConversation(null);
    setIsDeleteConversationDialogOpen(false);
  });

  const deleteMessage = useDeleteMessage(chatSocketRef);
  const sendMessage = useSendMessage(chatSocketRef);
  const updateMessage = useUpdateMessage(chatSocketRef);
  const readMessage = useReadMessage(chatSocketRef);

  const { handleStartTyping, handleStopTyping } = useChatTyping(
    chatSocketRef,
    conversation.conversationId,
  );

  const messages = data?.messages ?? [];
  const fileKeys = useMemo(() => {
    return [
      ...new Set(
        messages
          .map((message) => message.fileKey)
          .filter((key): key is string => Boolean(key)),
      ),
    ];
  }, [messages]);

  useEffect(() => {
    if (fileKeys.length === 0) {
      setDownloadUrls({});
      return;
    }

    let cancelled = false;
    const fetchDownloadUrls = async () => {
      try {
        const response = await createPresignedDownloadUrl({
          keys: fileKeys,
        });

        if (!cancelled) {
          setDownloadUrls(response.data.urls);
        }
      } catch {
        if (!cancelled) {
          setDownloadUrls({});
        }
      }
    };

    void fetchDownloadUrls();

    return () => {
      cancelled = true;
    };
  }, [fileKeys]);

  const handleDeleteConversationRequest = () => {
    setIsDeleteConversationDialogOpen(true);
  };

  const handleDeleteConversation = () => {
    deleteConversation.mutate(conversation.conversationId);
  };

  const handleDeleteMessageRequest = (messageId: string) => {
    setDeleteMessageId(messageId);
  };

  const handleDeleteMessage = () => {
    if (!deleteMessageId) {
      return;
    }

    deleteMessage({
      conversationId: conversation.conversationId,
      messageId: deleteMessageId,
    });

    setDeleteMessageId(null);
  };

  const handleEditMessage = (
    messageId: string,
    content: string,
  ) => {
    updateMessage({
      conversationId: conversation.conversationId,
      messageId,
      content,
    });

    setMessageInputMode({ type: 'idle' });
  };

  const handleSendMessage = (
    payload: {
      content?: string;
      type: 'TEXT' | 'IMAGE' | 'FILE';
      attachment?: {
        fileKey: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
      };
    },
  ) => {
    sendMessage(
      conversation.conversationId,
      payload.content ?? '',
      {
        type: payload.type,
        fileKey: payload.attachment?.fileKey,
        fileName: payload.attachment?.fileName,
        mimeType: payload.attachment?.mimeType,
        fileSize: payload.attachment?.fileSize,
      },
    );

    handleStopTyping();
  };

  const otherUser = conversation?.otherUser;
  const isOnline = otherUser
    ? onlineUsers.has(otherUser.userId)
    : false;

  const lastSeen = otherUser
    ? lastSeenMap.get(otherUser.userId) ?? null
    : null;

  const peerLastReadAt =
    peerReadAt.get(conversation.conversationId) ?? null;

  useEffect(() => {
    if (document.visibilityState !== 'visible' ||
      !chatSocketRef.current?.connected ||
      !currentUser?.userId
    ) {
      return;
    }

    const lastUnreadMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender.userId !== currentUser.userId &&
          !message.isRead,
      );

    if (!lastUnreadMessage) {
      return;
    }

    readMessage({
      conversationId: conversation.conversationId,
      messageId: lastUnreadMessage.messageId,
    });
  }, [
    conversation.conversationId,
    messages,
    currentUser?.userId,
    readMessage,
  ]);

  useEffect(() => {
    return () => {
      handleStopTyping();
      clearTypingForConversation(conversation.conversationId);
    };
  }, [
    conversation.conversationId,
    handleStopTyping,
    clearTypingForConversation,
  ]);

  if (!conversation) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        otherUser={conversation.otherUser}
        isOnline={isOnline}
        lastSeen={lastSeen}
        onDeleteConversation={handleDeleteConversationRequest}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUser?.userId ?? ''}
        peerLastReadAt={peerLastReadAt}
        isPeerOnline={isOnline}
        downloadUrls={downloadUrls}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onEditRequest={(messageId: string) => {
          const message = messages.find(
            (message) => message.messageId === messageId,
          );
          if (!message) {
            return;
          }
          setMessageInputMode({
            type: 'edit',
            message,
          });
        }}
        onDeleteRequest={(messageId: string) => {
          handleDeleteMessageRequest(messageId);
        }}
        onReplyRequest={(messageId: string) => {
          const message = messages.find(
            (message) => message.messageId === messageId,
          );
          if (!message) {
            return;
          }
          setMessageInputMode({
            type: 'reply',
            message,
          });
        }}
      />
      {typingUsers && typingUsers.size > 0 && <TypingIndicator />}
      <MessageInput
        mode={messageInputMode}
        onSend={handleSendMessage}
        onEdit={handleEditMessage}
        onStartTyping={handleStartTyping}
        onStopTyping={handleStopTyping}
        onCancelMode={() => {
          setMessageInputMode({ type: 'idle' });
        }}
        disabled={!chatSocketRef.current?.connected}
      />
      <AlertDialog
        open={isDeleteConversationDialogOpen}
        onOpenChange={setIsDeleteConversationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConversation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteConversation.isPending}
              onClick={handleDeleteConversation}
            >
              {deleteConversation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteMessageId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteMessageId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteMessage}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}