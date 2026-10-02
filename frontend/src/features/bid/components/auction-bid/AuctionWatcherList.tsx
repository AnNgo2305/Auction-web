import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar.tsx';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';

type AuctionWatcher = {
  userId: string;
  profileImageUrl?: string | null;
};

type AuctionWatcherListProps = {
  bidders: AuctionWatcher[];
};

const MAX_VISIBLE_AVATARS = 5;

export function AuctionWatcherList({ bidders }: AuctionWatcherListProps) {
  const navigate = useNavigate();

  const visibleBidders = bidders.slice(0, MAX_VISIBLE_AVATARS);
  const remainingCount = bidders.length - visibleBidders.length;

  const handleBidderClick = (userId: string) => {
    void navigate(`/profile/${userId}`);
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Watchers</h3>
          <p className="text-muted-foreground text-sm">
            {bidders.length} watchers
          </p>
        </div>

        <div className="flex items-center">
          {visibleBidders.map((bidder, index) => (
            <button
              key={bidder.userId}
              type="button"
              onClick={() => handleBidderClick(bidder.userId)}
              className="focus:ring-ring rounded-full transition-transform hover:z-10 hover:scale-110 focus:ring-2 focus:ring-offset-1 focus:outline-none"
              style={{
                marginLeft: index === 0 ? 0 : '-8px',
              }}
            >
              <Avatar className="border-background h-9 w-9 border-2">
                <AvatarImage
                  src={bidder.profileImageUrl ?? defaultAvatarImageUrl}
                  alt="Bidder avatar"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </button>
          ))}

          {remainingCount > 0 && (
            <div className="border-background bg-muted -ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-medium">
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
