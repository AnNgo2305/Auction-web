import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import { ConversationList } from '@/features/chat/components/ConversationItemList';
import { useChatStore } from '@/shared/stores/chat.store';
import { chatPaths } from '@/features/chat/constants/chat.routes';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
  const navigate = useNavigate();

  const { setActiveConversation, activeConversationId } = useChatStore();
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation.conversationId);
    setCurrentConversation(conversation);
    void navigate(chatPaths.conversation(conversation.conversationId));
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 shrink-0 border-r border-gray-200 bg-white">
        <ConversationList
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {currentConversation ? (
          <ChatPanel
            key={currentConversation.conversationId}
            conversation={currentConversation}
            chatSocketRef={chatSocketRef}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium"> Select a conversation</p>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
