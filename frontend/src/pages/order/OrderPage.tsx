import { useState } from 'react';
import { useGetMyOrders } from '@/features/order/hooks/useGetMyOrders';
import { useGetOrderById } from '@/features/order/hooks/useGetOrderById';
import { Skeleton } from '@/shared/ui/skeleton';
import { OrderDetailDialog } from '@/features/order/components/OrderDialog';
import { OrderItem } from '@/features/order/components/OrderItem';

function OrderItemSkeleton() {
  return (
    <>
      <div className="flex w-full items-center gap-6 px-4 py-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="hidden w-40 md:block">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="w-36">
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
        <div className="w-32">
          <Skeleton className="ml-auto h-6 w-20" />
        </div>
      </div>
      <div className="bg-border h-px w-full" />
    </>
  );
}

function OrderListSkeleton() {
  return (
    <div className="rounded-md border">
      {Array.from({ length: 5 }).map((_, index) => (
        <OrderItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function OrderPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useGetMyOrders();

  const { data: orderDetail, isLoading: isOrderDetailLoading } =
    useGetOrderById(selectedOrderId ?? '');

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOrderDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOrderDialogOpen(open);
  };

  return (
    <div className="mx-auto w-full max-w-9/12 space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>

        <p className="text-muted-foreground text-sm">
          View your order history and details.
        </p>
      </div>

      {isOrdersLoading && <OrderListSkeleton />}

      {isOrdersError && (
        <div className="rounded-md border p-6 text-center">
          <p className="text-destructive text-sm">Failed to load orders.</p>
        </div>
      )}

      {!isOrdersLoading && !isOrdersError && orders?.length === 0 && (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground text-sm">No orders found.</p>
        </div>
      )}

      {!isOrdersLoading && !isOrdersError && orders && orders.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          {orders.map((order) => (
            <OrderItem
              key={order.orderId}
              order={order}
              onClick={handleOrderClick}
            />
          ))}
        </div>
      )}

      <OrderDetailDialog
        open={isOrderDialogOpen}
        loading={isOrderDetailLoading}
        order={orderDetail ?? null}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  );
}

