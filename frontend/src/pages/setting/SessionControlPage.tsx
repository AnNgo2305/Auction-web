import { useState } from 'react';
import { ActiveSessionList } from '@/features/setting/components/ActiveSessionList';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/ui/alert-dialog';
import { useRevokeSession } from '@/features/setting/hooks/security/useRevokeSessions';
import { useGetActiveSessions } from '@/features/setting/hooks/security/useGetActiveSessions';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { LogOut, MonitorSmartphone, ShieldCheck } from 'lucide-react';

export function SessionControlPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const revokeSessionMutation = useRevokeSession(async () => {
    setSelectedSessionId(null);
  });

  const { data: sessions = [], isLoading } = useGetActiveSessions();

  const handleRevoke = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleConfirmRevoke = () => {
    if (!selectedSessionId) return;

    revokeSessionMutation.mutate(selectedSessionId);
  }

  return (
    <>
      <div className="mx-auto max-w-9/12 w-full space-y-8">
        <Card className="from-primary/10 via-primary/5 to-background overflow-hidden border-none bg-linear-to-r shadow-sm">
          <CardContent className="flex flex-col justify-between gap-6 p-8 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary h-7 w-7" />
                <h1 className="text-3xl font-bold tracking-tight">
                  Session Management
                </h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Review all devices currently signed into your account. If you
                notice an unfamiliar session, revoke it immediately to keep your
                account secure.
              </p>
            </div>
            <div className="bg-primary/10 flex h-24 w-24 items-center justify-center rounded-full">
              <MonitorSmartphone className="text-primary h-12 w-12" />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 xl:grid-cols-[280px_1fr_280px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MonitorSmartphone className="text-primary h-5 w-5" />
                  <span className="font-semibold">Active Devices</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{sessions.length}</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Devices currently signed in to your account.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Security Status</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Protection</span>
                  <span className="text-sm font-medium text-green-600">
                    Secure
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Session</span>
                  <span className="text-sm font-medium">
                    {sessions.some((s) => s.isCurrent) ? 'Verified' : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <ActiveSessionList
            sessions={sessions}
            isLoading={isLoading}
            onRevoke={handleRevoke}
            isRevoking={revokeSessionMutation.isPending}
          />
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Session Tips</span>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm">
                <p>• Remove sessions you don't recognize.</p>
                <p>• Don't share your account with others.</p>
                <p>• Sign out on public computers.</p>
                <p>• Change your password if suspicious activity appears.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <span className="font-semibold">Security Reminder</span>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Regularly reviewing your active sessions helps prevent
                unauthorized access and keeps your account protected.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AlertDialog
        open={!!selectedSessionId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSessionId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This device will be signed out immediately. You will need to log
              in again on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeSessionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={revokeSessionMutation.isPending}
              onClick={handleConfirmRevoke}
            >
              {revokeSessionMutation.isPending ? 'Revoking...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
