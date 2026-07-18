import { ShieldCheck, KeyRound, Lock, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ChangePasswordForm } from '@/features/setting/components/ChangePasswordForm';

export function ChangePasswordPage() {
  return (
    <div className="mx-auto w-full max-w-9/12 px-6">
      <Card className="from-primary/10 via-primary/5 to-background overflow-hidden border-none bg-linear-to-r">
        <CardContent className="flex items-center justify-between p-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary h-8 w-8" />
              <h1 className="text-3xl font-bold">Password & Security</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Keep your account secure by using a strong password and updating
              it regularly.
            </p>
            <Badge>Recommended every 90 days</Badge>
          </div>

          <div className="bg-primary/10 rounded-full p-6">
            <Lock className="text-primary h-12 w-12" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="text-primary h-5 w-5" />
                <span className="font-semibold">Password Requirements</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                At least 8 characters
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                Uppercase & lowercase letters
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                Include numbers
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                Special characters recommended
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="font-semibold">Why update?</span>
            </CardHeader>

            <CardContent className="text-muted-foreground text-sm">
              Regular password changes help protect your account from stolen
              credentials and unauthorized access.
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <ChangePasswordForm />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Security Tips</span>
              </div>
            </CardHeader>

            <CardContent className="text-muted-foreground space-y-3 text-sm">
              <p>• Never reuse passwords across different websites.</p>

              <p>• Avoid personal information like birthdays.</p>

              <p>• Use a password manager for stronger passwords.</p>

              <p>• Don't share your password with anyone.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="font-semibold">
                After changing your password
              </span>
            </CardHeader>

            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                • Existing sessions on other devices may require signing in
                again.
              </p>

              <p>• Remember to update saved passwords in your browser.</p>

              <p>
                • Review active sessions if you suspect unauthorized access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
