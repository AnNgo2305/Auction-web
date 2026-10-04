import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import qs from 'qs';
import { QueryTransactionResult } from '@modules/payment/dtos/query-transaction.response.dto';
import { VnpayPaymentReturnResult } from '../dtos/vnpay-payment-return.response.dto';

@Injectable()
export class VnpayService {
  constructor(private readonly configService: ConfigService) {}

  createPaymentUrl(params: {
    txnRef: string;
    amount: number;
    orderInfo: string;
    ipAddress: string;
  }): string {
    const now = new Date();
    const expireDate = new Date(now.getTime() + 15 * 60 * 1000);

    const vnpParams = {
      vnp_Version: this.configService.get<string>('vnpay.version'),
      vnp_Command: this.configService.get<string>('vnpay.command'),
      vnp_TmnCode: this.configService.get<string>('vnpay.tmnCode'),
      vnp_Amount: params.amount * 100,
      vnp_CreateDate: this.formatDate(now),
      vnp_CurrCode: this.configService.get<string>('vnpay.currCode'),
      vnp_IpAddr: params.ipAddress,
      vnp_Locale: this.configService.get<string>('vnpay.locale'),
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: this.configService.get<string>('vnpay.orderType'),
      vnp_ReturnUrl: this.configService.get<string>('vnpay.returnUrl'),
      vnp_ExpireDate: this.formatDate(expireDate),
      vnp_TxnRef: params.txnRef,
    };

    const sortedParams = this.sortObject(vnpParams);
    const signData = qs.stringify(sortedParams);

    sortedParams.vnp_SecureHash = this.generateSignature(signData);
    const paymentUrl = this.configService.get<string>('vnpay.paymentUrl');

    return `${paymentUrl}?${qs.stringify(sortedParams)}`;
  }

  async queryTransaction(params: {
    txnRef: string;
    transactionDate: string;
    orderInfo: string;
    ipAddress: string;
  }): Promise<QueryTransactionResult> {
    const requestId = crypto.randomUUID();
    const createDate = this.formatDate(new Date());

    const version = this.configService.get<string>('vnpay.version')!;
    const queryCommand = this.configService.get<string>('vnpay.queryCommand')!;
    const tmnCode = this.configService.get<string>('vnpay.tmnCode')!;
    const queryUrl = this.configService.get<string>('vnpay.queryUrl')!;

    const signData = [
      requestId,
      version,
      queryCommand,
      tmnCode,
      params.txnRef,
      params.orderInfo,
      params.transactionDate,
      createDate,
      params.ipAddress,
    ].join('|');

    const secureHash = this.generateSignature(signData);

    const requestBody = {
      vnp_RequestId: requestId,
      vnp_Version: version,
      vnp_Command: queryCommand,
      vnp_TmnCode: tmnCode,
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_TransactionDate: params.transactionDate,
      vnp_CreateDate: createDate,
      vnp_IpAddr: params.ipAddress,
      vnp_SecureHash: secureHash,
    };

    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `VNPay QueryDR request failed with status ${response.status}`,
      );
    }

    const result = (await response.json()) as Record<string, string>;

    return {
      responseCode: result.vnp_ResponseCode,
      message: result.vnp_Message,
      transactionStatus: result.vnp_TransactionStatus,
      transactionNo: result.vnp_TransactionNo,
      amount: result.vnp_Amount,
      payDate: result.vnp_PayDate,
    };
  }

  private generateSignature(data: string): string {
    const hashSecret = this.configService.get<string>('vnpay.hashSecret');

    return crypto
      .createHmac('sha512', hashSecret!)
      .update(data, 'utf-8')
      .digest('hex');
  }

  private sortObject(
    params: Record<string, string | number | undefined>,
  ): Record<string, string> {
    return Object.keys(params)
      .filter((key) => params[key] !== undefined)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = String(params[key]);

          return result;
        },
        {} as Record<string, string>,
      );
  }

  private formatDate(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);

    const values = Object.fromEntries(
      parts
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, value]),
    );

    return (
      `${values.year}${values.month}${values.day}` +
      `${values.hour}${values.minute}${values.second}`
    );
  }

  verifyPayment(params: Record<string, string>): boolean {
    const secureHash = params.vnp_SecureHash;
    if (!secureHash) {
      return false;
    }

    const paramsToVerify: Record<string, string> = {
      vnp_TmnCode: params.vnp_TmnCode,
      vnp_Amount: params.vnp_Amount,
      vnp_BankCode: params.vnp_BankCode,
      vnp_BankTranNo: params.vnp_BankTranNo,
      vnp_CardType: params.vnp_CardType,
      vnp_PayDate: params.vnp_PayDate,
      vnp_OrderInfo: params.vnp_OrderInfo,
      vnp_TransactionNo: params.vnp_TransactionNo,
      vnp_ResponseCode: params.vnp_ResponseCode,
      vnp_TransactionStatus: params.vnp_TransactionStatus,
      vnp_TxnRef: params.vnp_TxnRef,
    };

    const sortedParams = this.sortObject(paramsToVerify);
    const signData = qs.stringify(sortedParams, { encode: false });

    const calculatedHash = this.generateSignature(signData);

    return calculatedHash === secureHash;
  }

  processPaymentReturn(
    params: Record<string, string>,
  ): VnpayPaymentReturnResult {
    const isValid = this.verifyPayment(params);

    const {
      vnp_TxnRef: txnRef,
      vnp_Amount: amount,
      vnp_ResponseCode: responseCode,
      vnp_TransactionStatus: transactionStatus,
      vnp_TransactionNo: transactionNo,
      vnp_OrderInfo: orderInfo,
    } = params;

    if (!isValid) {
      return {
        success: false,
        code: '97',
      };
    }

    return {
      success: responseCode === '00' && transactionStatus === '00',
      code: responseCode,
      txnRef,
      amount,
      transactionNo,
      orderInfo,
    };
  }
}
