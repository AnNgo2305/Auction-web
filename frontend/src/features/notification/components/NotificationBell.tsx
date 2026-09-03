import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useGetUnreadNotificationCount } from '@/features/notification/hooks/useGetUnreadCount';
import { NotificationDropDown } from '@/features/notification/components/NotificationDropDown';
import { useNotificationSocket } from '@/features/notification/hooks/useNotificationSocket';

export function NotificationBell() {
  useNotificationSocket();
  const { data: unreadCount = 0 } = useGetUnreadNotificationCount();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-90 p-0">
        <NotificationDropDown onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
