import { Bell } from 'lucide-react';

export function NotificationSettingPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Notification Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage how and when you receive notifications.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed py-20 text-center">
        <Bell className="text-muted-foreground mx-auto mb-4 h-10 w-10 opacity-50" />
        <h2 className="text-foreground text-lg font-medium">Coming soon</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Notification preferences will be available in a future update.
        </p>
      </div>
    </section>
  );
}
