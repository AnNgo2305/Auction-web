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

export function SessionControlPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const revokeSessionMutation = useRevokeSession(() => {
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
      <ActiveSessionList
        sessions={sessions}
        isLoading={isLoading}
        onRevoke={handleRevoke}
        isRevoking={revokeSessionMutation.isPending}
      />
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
            <AlertDialogTitle>
              Revoke this session?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This device will be signed out immediately. You will need to
              login again on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={revokeSessionMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={revokeSessionMutation.isPending}
              onClick={handleConfirmRevoke}
            >
              {revokeSessionMutation.isPending
                ? 'Revoking...'
                : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
