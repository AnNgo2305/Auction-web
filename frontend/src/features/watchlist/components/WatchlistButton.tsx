import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { WatchlistDropdown } from '@/features/watchlist/components/WatchlistDropdown';

export function WatchlistButton() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
        >
          <Bookmark className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-90 p-0">
        <WatchlistDropdown />
      </PopoverContent>
    </Popover>
  );
}
