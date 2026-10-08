import { PaymentList } from '@/features/payment/components/PaymentList';
import { useGetMyPayments } from '@/features/payment/hooks/useGetMyPayments';

export function PaymentPage() {
  const { data: payments = [], isLoading } = useGetMyPayments();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">My Payments</h1>
        <p className="text-muted-foreground">View your payment history.</p>
      </div>

      <PaymentList payments={payments} isLoading={isLoading} />
    </div>
  );
}
