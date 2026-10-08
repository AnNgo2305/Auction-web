import { Skeleton } from '@/shared/ui/skeleton';
import type { MyPaymentData } from '@/features/payment/types/my-payments.response';
import PaymentItem from './PaymentItem';

type PaymentListProps = {
  payments: MyPaymentData[];
  isLoading?: boolean;
};

export function PaymentList({ payments, isLoading = false }: PaymentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>

            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border p-8 text-center">
        No payments found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <PaymentItem key={payment.paymentId} payment={payment} />
      ))}
    </div>
  );
}
