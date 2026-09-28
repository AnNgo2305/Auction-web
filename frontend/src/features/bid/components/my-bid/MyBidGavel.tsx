import { useState } from 'react';
import { Gavel } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { MyBidDropdown } from '@/features/bid/components/my-bid/MyBidDropdown';

export function MyBidGavel() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
          aria-label="My bids"
        >
          <Gavel className="h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-90 p-0"
      >
        <MyBidDropdown onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
