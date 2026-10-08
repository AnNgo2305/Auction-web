export const paymentKeys = {
  all: ['payments'] as const,
  myPayments: () => [...paymentKeys.all, 'me'] as const,
} as const;
