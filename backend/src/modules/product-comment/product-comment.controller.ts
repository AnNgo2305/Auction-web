import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProductCommentService } from '@modules/product-comment/product-comment.service';
import { Auth } from '@common/decorators/auth.decorator';
import { CreateProductCommentDto } from '@modules/product-comment/dtos/create-product-comment.body.dto';
import { UpdateProductCommentDto } from '@modules/product-comment/dtos/update-product-comment.body.dto';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { GetProductCommentsResponseDto } from '@modules/product-comment/dtos/get-product-comments.response.dto';
import {
  ERROR_PRODUCT_COMMENT_ACCESS_DENIED,
  ERROR_PRODUCT_COMMENT_NOT_FOUND,
} from '@modules/product-comment/product-comment.constant';

@ApiTags('Product Comments')
@ApiExtraModels(SuccessResponse, ErrorResponse, GetProductCommentsResponseDto)
@Controller('product-comments')
@Controller('product-comments')
export class ProductCommentController {
  constructor(private readonly productCommentService: ProductCommentService) {}

  @Auth(AuthType.NONE)
  @Get(':productId/comments')
  @Throttle({
    short: { ttl: 1_000, limit: 20 },
    medium: { ttl: 10_000, limit: 100 },
    long: { ttl: 60_000, limit: 500 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get product comments',
    description:
      'Retrieves comments for a product using cursor-based pagination. Authentication is optional.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product comments retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetProductCommentsResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Product comments retrieved successfully',
      data: {
        comments: [
          {
            commentId: '770e8400-e29b-41d4-a716-446655440000',
            content: 'Great product!',
            rating: 5,
            createdAt: '2026-09-22T05:30:00.000Z',
            updatedAt: '2026-09-22T05:30:00.000Z',
            user: {
              userId: '550e8400-e29b-41d4-a716-446655440000',
              username: 'nguyenvana',
              profileImageUrl: 'https://example.com/avatar.jpg',
            },
          },
        ],
        nextCursor: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  async getComments(
    @Param('productId') productId: string,
    @Query('cursor') cursor?: string,
    @Req() req?: Request,
  ): Promise<ResponsePayload> {
    const userId = req?.user?.userId;

    const data = await this.productCommentService.getCommentsByProduct(
      productId,
      userId,
      cursor,
    );

    return {
      message: 'Product comments retrieved successfully',
      data,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Post(':productId/comments')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @ApiOperation({
    summary: 'Create product comment',
    description: 'Creates a comment for a product by the authenticated user.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiBody({ type: CreateProductCommentDto })
  @ApiOkResponse({
    description: 'Product comment created successfully',
    type: SuccessResponse,
    example: {
      statusCode: 201,
      message: 'Product comment created successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('productId') productId: string,
    @Body() body: CreateProductCommentDto,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;

    await this.productCommentService.createComment(
      userId,
      productId,
      body.content,
      body.rating,
    );

    return {
      message: 'Product comment created successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Patch(':productId/comments/:commentId')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product comment',
    description: 'Updates a product comment owned by the authenticated user.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiParam({ name: 'commentId', type: String, description: 'Comment ID' })
  @ApiBody({ type: UpdateProductCommentDto })
  @ApiOkResponse({
    description: 'Product comment updated successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product comment updated successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Product comment not found',
    type: ErrorResponse,
    examples: {
      productCommentNotFound: {
        summary: 'Comment does not exist',
        value: ERROR_PRODUCT_COMMENT_NOT_FOUND,
      },
      invalidProduct: {
        summary: 'Comment does not belong to the specified product',
        value: ERROR_PRODUCT_COMMENT_NOT_FOUND,
      },
    },
  })
  @ApiForbiddenResponse({
    description: ERROR_PRODUCT_COMMENT_ACCESS_DENIED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_COMMENT_ACCESS_DENIED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async updateComment(
    @Param('productId') productId: string,
    @Param('commentId') commentId: string,
    @Body() body: UpdateProductCommentDto,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;

    await this.productCommentService.updateComment(
      userId,
      productId,
      commentId,
      body.content,
      body.rating,
    );

    return {
      message: 'Product comment updated successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Delete(':productId/comments/:commentId')
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product comment',
    description: 'Deletes a product comment owned by the authenticated user.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiParam({ name: 'commentId', type: String, description: 'Comment ID' })
  @ApiOkResponse({
    description: 'Product comment deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product comment deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Product comment not found',
    type: ErrorResponse,
    examples: {
      productCommentNotFound: {
        summary: 'Comment does not exist',
        value: ERROR_PRODUCT_COMMENT_NOT_FOUND,
      },
      invalidProduct: {
        summary: 'Comment does not belong to the specified product',
        value: ERROR_PRODUCT_COMMENT_NOT_FOUND,
      },
    },
  })
  @ApiForbiddenResponse({
    description: ERROR_PRODUCT_COMMENT_ACCESS_DENIED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_COMMENT_ACCESS_DENIED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteComment(
    @Param('productId') productId: string,
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;

    await this.productCommentService.deleteComment(
      userId,
      productId,
      commentId,
    );

    return {
      message: 'Product comment deleted successfully',
      data: {},
    };
  }
}
