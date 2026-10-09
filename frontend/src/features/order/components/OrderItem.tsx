import type { MyOrderData } from '@/features/order/types/my-order.response';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/types/order-status';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { useCreatePayment } from '@/features/payment/hooks/useCreatePayment';

type OrderItemProps = {
  order: MyOrderData;
  onClick?: (orderId: string) => void;
};

const statusLabel: Record<OrderStatus, string> = {
  PENDING: 'Pending Payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPING: 'Shipping',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

const statusVariant: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  PAID: 'secondary',
  PROCESSING: 'secondary',
  SHIPPING: 'default',
  COMPLETED: 'default',
  CANCELED: 'destructive',
};

export function OrderItem({ order, onClick }: OrderItemProps) {
  const createPayment = useCreatePayment();

  const amount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(order.totalAmount);

  const createdAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(order.createdAt));

  const handlePay = async () => {
    const response = await createPayment.mutateAsync({
      orderId: order.orderId,
      idempotencyKey: crypto.randomUUID(),
    });

    window.location.href = response.data.paymentUrl;
  };

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4">
        <button
          type="button"
          className="hover:bg-muted/50 flex min-w-0 flex-1 items-center gap-6 text-left transition-colors"
          onClick={() => onClick?.(order.orderId)}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{order.orderCode}</p>

            <p className="text-muted-foreground mt-1 truncate text-sm">
              {order.auctionTitle}
            </p>
          </div>

          <div className="text-muted-foreground hidden w-40 text-sm md:block">
            {createdAt}
          </div>

          <div className="w-36 text-right text-sm font-semibold">{amount}</div>

          <div className="w-32 text-right">
            <Badge variant={statusVariant[order.status]}>
              {statusLabel[order.status]}
            </Badge>
          </div>
        </button>

        {order.status === ORDER_STATUSES.PENDING && (
          <Button
            type="button"
            size="sm"
            disabled={createPayment.isPending}
            onClick={() => void handlePay()}
          >
            {createPayment.isPending ? 'Processing...' : 'Pay Now'}
          </Button>
        )}
      </div>

      <Separator />
    </>
  );
}
