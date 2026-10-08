import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import type { MyPaymentData } from '@/features/payment/types/my-payments.response';

type PaymentItemProps = {
  payment: MyPaymentData;
}

const paymentStatusLabel = {
  PENDING: 'Pending',
  SUCCESS: 'Successful',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
} as const;

export default function PaymentItem({ payment }: PaymentItemProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="font-medium">Payment #{payment.paymentId}</p>

          <p className="text-muted-foreground text-sm">
            Order: {payment.orderId}
          </p>

          <p className="text-muted-foreground text-sm">
            {new Date(payment.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold">{payment.amount.toLocaleString()} VND</p>

          <Badge variant="outline">{paymentStatusLabel[payment.status]}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
