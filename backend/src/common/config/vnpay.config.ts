import { registerAs } from '@nestjs/config';

export default registerAs('vnpay', () => ({
  tmnCode: process.env.VNPAY_TMN_CODE as string,
  hashSecret: process.env.VNPAY_HASH_SECRET as string,

  paymentUrl: process.env.VNPAY_PAYMENT_URL as string,
  queryUrl: process.env.VNPAY_QUERY_URL as string,
  returnUrl: process.env.VNPAY_RETURN_URL as string,

  version: process.env.VNPAY_VERSION as string,
  command: process.env.VNPAY_COMMAND as string,
  queryCommand: process.env.VNPAY_QUERY_COMMAND as string,
  orderType: process.env.VNPAY_ORDER_TYPE as string,
  locale: process.env.VNPAY_LOCALE as string,
  currCode: process.env.VNPAY_CURR_CODE as string,

  serverIp: process.env.VNPAY_SERVER_IP as string,
}));
