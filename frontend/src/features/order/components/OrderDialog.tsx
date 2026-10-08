import type { OrderStatus } from '@/shared/types/order-status';
import type { PaymentStatus } from '@/shared/types/payment-status';
import type { GetOrderByIdData } from '@/features/order/types/get-order-by-id.response';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

type OrderDetailDialogProps = {
  open: boolean;
  loading: boolean;
  order: GetOrderByIdData | null;
  onOpenChange: (open: boolean) => void;
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

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Successful',
  FAILED: 'Failed',
  CANCELED: 'Canceled',
};

const paymentStatusVariant: Record<
  PaymentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  SUCCESS: 'default',
  FAILED: 'destructive',
  CANCELED: 'secondary',
};

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-28" />
        </div>

        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="ml-auto h-5 w-36" />
        </div>
      </div>

      <Separator />

      <div>
        <Skeleton className="mb-3 h-5 w-20" />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>

                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      <div>
        <Skeleton className="mb-3 h-5 w-20" />

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}

export function OrderDetailDialog({
  open,
  loading,
  order,
  onOpenChange,
}: OrderDetailDialogProps) {
  const totalAmount = order
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(order.totalAmount)
    : null;

  const createdAt = order
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(order.createdAt))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>

          <DialogDescription>
            {loading || !order ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              `#${order.orderCode}`
            )}
          </DialogDescription>
        </DialogHeader>

        {loading || !order ? (
          <OrderDetailSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Status</p>

                <div className="mt-1">
                  <Badge variant={statusVariant[order.status]}>
                    {statusLabel[order.status]}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <p className="text-muted-foreground text-sm">Order Date</p>

                <p className="mt-1 text-sm font-medium">{createdAt}</p>
              </div>
            </div>

            <Separator />

            {/* Products */}
            <div>
              <h3 className="mb-3 font-medium">Products</h3>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {order.products.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>{product.name}</TableCell>

                        <TableCell className="text-right">
                          {product.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* Payments */}
            <div>
              <h3 className="mb-3 font-medium">Payments</h3>

              <div className="space-y-4">
                {order.payments.map((payment) => {
                  const amount = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(payment.amount);

                  const paidAt = payment.paidAt
                    ? new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(payment.paidAt))
                    : null;

                  return (
                    <div
                      key={payment.paymentId}
                      className="rounded-md border p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <Badge variant={paymentStatusVariant[payment.status]}>
                          {paymentStatusLabel[payment.status]}
                        </Badge>

                        <span className="font-medium">{amount}</span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        {payment.transactionRef && (
                          <div>
                            <p className="text-muted-foreground">
                              Transaction Ref
                            </p>

                            <p className="font-medium break-all">
                              {payment.transactionRef}
                            </p>
                          </div>
                        )}

                        {payment.transactionNo && (
                          <div>
                            <p className="text-muted-foreground">
                              Transaction No
                            </p>

                            <p className="font-medium break-all">
                              {payment.transactionNo}
                            </p>
                          </div>
                        )}

                        {payment.responseCode && (
                          <div>
                            <p className="text-muted-foreground">
                              Response Code
                            </p>

                            <p className="font-medium">
                              {payment.responseCode}
                            </p>
                          </div>
                        )}

                        {paidAt && (
                          <div>
                            <p className="text-muted-foreground">Paid At</p>

                            <p className="font-medium">{paidAt}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Amount</span>

              <span className="text-lg font-semibold">{totalAmount}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
