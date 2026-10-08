export const orderKeys = {
  all: ['orders'] as const,
  myOrders: () => [...orderKeys.all, 'me'] as const,
  detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
};
