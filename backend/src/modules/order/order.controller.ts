import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { OrderService } from './order.service';
import { MyOrderResponseDto } from './dtos/get-my-orders.response.dto';
import { GetOrderByIdResponseDto } from '@modules/order/dtos/get-order-by-id.response.dto';

@ApiTags('Orders')
@ApiExtraModels(SuccessResponse, MyOrderResponseDto)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('me')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my orders',
    description: 'Retrieves all orders of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Orders retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: getSchemaPath(MyOrderResponseDto),
              },
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Orders retrieved successfully',
      data: [
        {
          orderId: '550e8400-e29b-41d4-a716-446655440005',
          orderCode: 'ORD-1727000000-A1B2C3',
          auctionId: '550e8400-e29b-41d4-a716-446655440000',
          auctionTitle: 'MacBook Pro M4',
          totalAmount: 22500000,
          status: 'PENDING',
          createdAt: '2026-09-27T08:00:00.000Z',
          updatedAt: '2026-09-27T08:30:00.000Z',
        },
      ],
    },
  })
  @ApiCookieAuth('access_token')
  async getMyOrders(@Req() req: Request): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    const result = await this.orderService.findMyOrders(userId as string);

    return {
      message: 'Orders retrieved successfully',
      data: result,
    };
  }

  @Get(':orderId')
  @Roles(Role.BIDDER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Retrieves detailed information of an order owned by the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Order retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(GetOrderByIdResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: {
        orderId: '550e8400-e29b-41d4-a716-446655440005',
        orderCode: 'ORD-1727000000-A1B2C3',
        auctionId: '550e8400-e29b-41d4-a716-446655440000',
        buyerId: '550e8400-e29b-41d4-a716-446655440003',
        totalAmount: 22500000,
        status: 'PENDING',
        products: [
          {
            productId: '550e8400-e29b-41d4-a716-446655440001',
            name: 'MacBook Pro M4',
            quantity: 1,
          },
        ],
        payments: [
          {
            paymentId: '550e8400-e29b-41d4-a716-446655440004',
            status: 'SUCCESS',
            amount: 22500000,
            transactionRef: 'ORDER_1727000000',
            transactionNo: '14567890',
            responseCode: '00',
            paidAt: '2026-09-27T08:30:00.000Z',
            createdAt: '2026-09-27T08:15:00.000Z',
          },
        ],
        createdAt: '2026-09-27T08:00:00.000Z',
        updatedAt: '2026-09-27T08:30:00.000Z',
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getOrderById(
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    const result = await this.orderService.findById(orderId, userId as string);

    return {
      message: 'Order retrieved successfully',
      data: result,
    };
  }
}
