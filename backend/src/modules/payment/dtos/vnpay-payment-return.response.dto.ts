export class VnpayPaymentReturnResult {
  success: boolean;
  code: string;
  txnRef?: string;
  amount?: string;
  transactionNo?: string;
  orderInfo?: string;
}
