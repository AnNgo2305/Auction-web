import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { ConversationList } from '@/features/chat/components/ConversationItemList';
import { useChatStore } from '@/shared/stores/chat.store';
import { chatPaths } from '@/features/chat/constants/chat.routes';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetConversationById } from '@/features/chat/hooks/conversation/useGetConversationById';
import { ChatPanelSkeleton } from '@/features/chat/components/ChatPanelSkeleton';
import { useUser } from '@/shared/contexts/UserContext';
import { useEffect } from 'react';

type Conversation = {
  conversationId: string;
  otherUser: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };
};

export function ChatPage() {
  const chatSocketRef = useChatSocket();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const {
    data: currentConversation,
    isLoading: isConversationLoading,
    isError: isConversationError,
  } = useGetConversationById(conversationId);

  const { setActiveConversation, activeConversationId } = useChatStore();

  useEffect(() => {
    if (currentConversation) {
      setActiveConversation(currentConversation.conversationId);
      return;
    }

    if (isConversationError) {
      setActiveConversation(null);
    }
  }, [currentConversation, isConversationError, setActiveConversation]);

  const otherUser =
    currentConversation && currentUser
      ? currentConversation.initiator.userId === currentUser.userId
        ? currentConversation.recipient
        : currentConversation.initiator
      : null;

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation.conversationId);
    void navigate(chatPaths.conversation(conversation.conversationId));
  };

  const displayedActiveConversationId = isConversationError
    ? null
    : (conversationId ?? activeConversationId);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 shrink-0 border-r border-gray-200 bg-white">
        <ConversationList
          activeConversationId={displayedActiveConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {!conversationId ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : isConversationLoading ? (
          <ChatPanelSkeleton />
        ) : isConversationError || !currentConversation || !otherUser ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Conversation not found</p>
          </div>
        ) : (
          <ChatPanel
            key={currentConversation.conversationId}
            conversation={{
              conversationId: currentConversation.conversationId,
              otherUser: {
                userId: otherUser.userId,
                username: otherUser.username,
                profileImageUrl: otherUser.profileImageUrl,
              },
              isDeleted: currentConversation.isDeleted
            }}
            chatSocketRef={chatSocketRef}
          />
        )}
      </div>
    </div>
  );
}
