import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/routes/guards/ProtectedRoute';
import { ChatPage } from '@/pages/chat/ChatPage';
import { CHAT_ROUTES } from '@/features/chat/constants/chat.routes';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROLES } from '@/shared/types/user';

export default function ChatRoutes() {
  return (
    <Routes>
      <Route
        element={<ProtectedRoute allowedRoles={[ROLES.SELLER, ROLES.BIDDER]} />}
      >
        <Route path={CHAT_ROUTES.ROOT} element={<ChatPage />} />
        <Route path={CHAT_ROUTES.CONVERSATION} element={<ChatPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
