import { Route, Routes } from 'react-router-dom';
import PublicRoute from '@/routes/guards/PublicRoute';
import { AUCTION_ROUTES } from '@/features/auction/constants/auction.routes';
import { AuctionGalleryPage } from '@/pages/auction/AuctionsPage';
import { AuctionDetailPage } from '@/pages/auction/AuctionDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage.tsx';

export default function AuctionRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route index element={<AuctionGalleryPage />} />
        <Route path={AUCTION_ROUTES.DETAIL} element={<AuctionDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
