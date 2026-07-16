import type { ActiveSessionData } from '@/features/setting/types/get-active-sessions.response';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Calendar, Clock, Globe, MonitorSmartphone, Timer } from 'lucide-react';

interface ActiveSessionListProps {
  sessions: ActiveSessionData[];
  isLoading: boolean;
  onRevoke: (sessionId: string) => void;
  isRevoking?: boolean;
}

export function ActiveSessions({
  sessions,
  isLoading,
  onRevoke,
  isRevoking = false,
}: ActiveSessionListProps) {
  if (isLoading) {
    return (
      <Card className="mx-auto w-full max-w-2xl shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>

        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl shadow-lg">
      <CardHeader>
        <h2 className="text-xl font-semibold">Active Sessions</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorSmartphone size={18} />
                <span className="font-medium">{session.provider}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={isRevoking}
                onClick={() => onRevoke(session.id)}
              >
                Revoke
              </Button>
            </div>
            <div className="text-muted-foreground space-y-2 text-sm">
              <div className="flex items-center gap-2 truncate max-w-md">
                <MonitorSmartphone size={15} />
                <span>{session.userAgent ?? 'Unknown device'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={15} />
                <span>IP: {session.ip ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} />
                <span>
                  Created: {new Date(session.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} />
                <span>
                  Last used: {new Date(session.lastUsedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer size={15} />
                <span>
                  Expires: {new Date(session.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}