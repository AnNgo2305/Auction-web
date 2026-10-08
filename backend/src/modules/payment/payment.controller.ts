import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@generated/prisma/enums';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SuccessResponse } from '@common/types/response.dto';
import { PaymentService } from '@modules/payment/services/payment.service';
import { MyPaymentsResponseDto } from '@modules/payment/dtos/get-my-payments.response.dto';
import { VnpayService } from '@modules/payment/services/vnpay.service';

@ApiTags('Payments')
@ApiExtraModels(SuccessResponse, MyPaymentsResponseDto)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly vnpayService: VnpayService,
  ) {}

  @Get('me')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my payments',
    description: 'Retrieves all payments of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Payments retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                payments: {
                  type: 'array',
                  items: {
                    $ref: getSchemaPath(MyPaymentsResponseDto),
                  },
                },
              },
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Payments retrieved successfully',
      data: {
        payments: [
          {
            paymentId: '550e8400-e29b-41d4-a716-446655440005',
            orderId: '550e8400-e29b-41d4-a716-446655440006',
            amount: 22500000,
            status: 'SUCCESS',
            transactionRef: '550e8400-e29b-41d4-a716-446655440005',
            transactionNo: '14979514',
            responseCode: '00',
            paidAt: '2026-09-27T08:30:00.000Z',
            createdAt: '2026-09-27T08:00:00.000Z',
            updatedAt: '2026-09-27T08:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getMyPayments(@Req() req: Request): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    const payments = await this.paymentService.getMyPayments(userId as string);

    return {
      message: 'Payments retrieved successfully',
      data: {
        payments,
      },
    };
  }

  @Post(':orderId')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create payment',
    description: 'Creates a VNPay payment URL for the specified order.',
  })
  @ApiOkResponse({
    description: 'Payment URL created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                paymentUrl: {
                  type: 'string',
                  example:
                    'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...',
                },
              },
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Payment URL created successfully',
      data: {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...',
      },
    },
  })
  @ApiCookieAuth('access_token')
  async createPayment(
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const idempotencyKey = req.headers['idempotency-key'];

    const result = await this.paymentService.createPayment(
      orderId,
      userId as string,
      req.ip ?? '',
      idempotencyKey as string,
    );

    return {
      message: 'Payment URL created successfully',
      data: result,
    };
  }

  @Post('vnpay/ipn')
  @Auth(AuthType.NONE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle VNPay IPN',
    description: 'Handles payment notification sent directly from VNPay.',
  })
  @ApiOkResponse({
    description: 'VNPay IPN processed successfully',
    schema: {
      type: 'object',
      properties: {
        RspCode: {
          type: 'string',
          example: '00',
        },
        Message: {
          type: 'string',
          example: 'Confirm Success',
        },
      },
    },
  })
  async handleVnpayIpn(
    @Body() params: Record<string, string>,
  ): Promise<{ RspCode: string; Message: string }> {
    try {
      await this.paymentService.handleVnpayCallback(params);

      return {
        RspCode: '00',
        Message: 'Confirm Success',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          RspCode: '04',
          Message: error.message,
        };
      }

      if (error instanceof NotFoundException) {
        return {
          RspCode: '01',
          Message: error.message,
        };
      }

      return {
        RspCode: '99',
        Message: 'Unknown error',
      };
    }
  }

  @Get('vnpay/return')
  @Auth(AuthType.NONE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle VNPay payment return',
    description:
      'Handles the payment result returned by VNPay after the customer completes or cancels the payment. ' +
      'This endpoint is called through the customer browser and is used to display the payment result. ' +
      'It does not update the payment or order status in the database.',
  })
  @ApiOkResponse({
    description: 'VNPay payment return processed successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  description:
                    'Indicates whether the VNPay transaction was successful.',
                  example: true,
                },
                code: {
                  type: 'string',
                  description:
                    'VNPay response code. Code 00 indicates a successful payment.',
                  example: '00',
                },
                txnRef: {
                  type: 'string',
                  nullable: true,
                  description: 'Merchant transaction reference.',
                  example: '550e8400-e29b-41d4-a716-446655440005',
                },
                amount: {
                  type: 'string',
                  nullable: true,
                  description:
                    'Transaction amount returned by VNPay. The value is multiplied by 100.',
                  example: '2250000000',
                },
                transactionNo: {
                  type: 'string',
                  nullable: true,
                  description: 'VNPay transaction number.',
                  example: '14979514',
                },
                orderInfo: {
                  type: 'string',
                  nullable: true,
                  description: 'Order information sent to VNPay.',
                  example: 'Paying for ORD-20260927-001 order',
                },
              },
            },
          },
        },
      ],
    },
    examples: {
      success: {
        summary: 'Payment successful',
        value: {
          statusCode: 200,
          message: 'Payment result retrieved successfully',
          data: {
            success: true,
            code: '00',
            txnRef: '550e8400-e29b-41d4-a716-446655440005',
            amount: '2250000000',
            transactionNo: '14979514',
            orderInfo: 'Paying for ORD-20260927-001 order',
          },
        },
      },
      failed: {
        summary: 'Payment failed',
        value: {
          statusCode: 200,
          message: 'Payment result retrieved successfully',
          data: {
            success: false,
            code: '24',
            txnRef: '550e8400-e29b-41d4-a716-446655440005',
            amount: '2250000000',
            transactionNo: '0',
            orderInfo: 'Paying for ORD-20260927-001 order',
          },
        },
      },
      invalidSignature: {
        summary: 'Invalid signature',
        value: {
          statusCode: 200,
          message: 'Payment result retrieved successfully',
          data: {
            success: false,
            code: '97',
          },
        },
      },
    },
  })
  handleVnpayReturn(@Query() params: Record<string, string>): ResponsePayload {
    const result = this.vnpayService.processPaymentReturn(params);

    return {
      message: 'Payment result retrieved successfully',
      data: result,
    };
  }
}
