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
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@generated/prisma/enums';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.body.dto';
import { UpdateProductDto } from './dtos/update-product.body.dto';
import { GetMyProductsQueryDto } from './dtos/get-my-products.query.dto';
import { GetProductsQueryDto } from './dtos/get-products.query.dto';
import { ProductStatusBulkActionDto } from './dtos/product-status-bulk-action.body.dto';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import {
  ERROR_CANNOT_SET_PRODUCT_STATUS,
  ERROR_CANNOT_UPDATE_PRODUCT,
  ERROR_CATEGORIES_NOT_FOUND,
  ERROR_PRODUCT_NAME_ALREADY_EXISTS,
  ERROR_PRODUCT_NOT_FOUND,
  ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
} from '@modules/product/product.constant';
import { GetProductsResponseDto } from '@modules/product/dtos/get-products.response.dto';
import { GetMyProductsResponseDto } from '@modules/product/dtos/get-my-products.response.dto';
import { GetProductByIdResponseDto } from '@modules/product/dtos/get-product-by-id.response.dto';
import { PaginationResult } from '@common/types/pagination.interface';

@ApiTags('Products')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  PaginationResult,
  GetProductsResponseDto,
  GetMyProductsResponseDto,
  GetProductByIdResponseDto,
)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    short: { ttl: 1_000, limit: 15 },
    medium: { ttl: 10_000, limit: 75 },
    long: { ttl: 60_000, limit: 300 },
  })
  @ApiOperation({
    summary: 'Get products',
    description:
      'Retrieves publicly available products using filters, sorting, and cursor-based pagination.',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PaginationResult) },
                {
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(GetProductsResponseDto),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Products retrieved successfully',
      data: {
        data: [
          {
            sellerId: '550e8400-e29b-41d4-a716-446655440000',
            sellerName: 'nguyenvana',
            productId: '660e8400-e29b-41d4-a716-446655440000',
            name: 'Sony Alpha Camera',
            publicCategory: 'ELECTRONICS',
            thumbnail:
              'https://storage.example.com/products/camera/thumbnail.jpg',
            categories: [
              {
                categoryId: '770e8400-e29b-41d4-a716-446655440000',
                name: 'Cameras',
              },
            ],
            createdAt: '2026-09-22T05:30:00.000Z',
          },
        ],
        meta: {
          limit: 10,
          itemCount: 1,
          hasNextPage: true,
          nextCursor: '880e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  async getProducts(
    @Query() query: GetProductsQueryDto,
  ): Promise<ResponsePayload> {
    const products = await this.productService.getProducts(query);

    return {
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Get('me')
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my products',
    description:
      'Retrieves products created by the authenticated seller using filters, sorting, and cursor-based pagination.',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PaginationResult) },
                {
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: getSchemaPath(GetMyProductsResponseDto),
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Products retrieved successfully',
      data: {
        data: [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Sony Alpha Camera',
            description: 'A mirrorless camera in excellent condition.',
            stockQuantity: 10,
            status: 'READY',
            thumbnail:
              'https://storage.example.com/products/camera/thumbnail.jpg',
            publicCategory: 'ELECTRONICS',
            categories: [
              {
                categoryId: '660e8400-e29b-41d4-a716-446655440000',
                name: 'Cameras',
              },
            ],
            createdAt: '2026-09-22T05:30:00.000Z',
            updatedAt: '2026-09-22T06:00:00.000Z',
          },
        ],
        meta: {
          limit: 10,
          itemCount: 1,
          hasNextPage: true,
          nextCursor: '770e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getMyProducts(
    @Req() req: Request,
    @Query() query: GetMyProductsQueryDto,
  ): Promise<ResponsePayload> {
    const products = await this.productService.getMyProducts(
      req.user!.userId,
      query,
    );

    return {
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':id/publish')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish product',
    description:
      'Publishes a product by changing its status from DRAFT to READY.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product published successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product published successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async publishProduct(
    @Req() req: Request,
    @Param('id') productId: string,
  ): Promise<ResponsePayload> {
    await this.productService.publishProduct(req.user!.userId, productId);

    return {
      message: 'Product published successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':id/remove')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove product',
    description:
      'Removes a product by changing its status from READY to REMOVED.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product removed successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product removed successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async removeProduct(
    @Req() req: Request,
    @Param('id') productId: string,
  ): Promise<ResponsePayload> {
    await this.productService.removeProduct(req.user!.userId, productId);

    return {
      message: 'Product removed successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':id/restore')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore product',
    description:
      'Restores a removed product by changing its status from REMOVED to DRAFT.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product restored successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product restored successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async restoreProduct(
    @Req() req: Request,
    @Param('id') productId: string,
  ): Promise<ResponsePayload> {
    await this.productService.restoreProduct(req.user!.userId, productId);

    return {
      message: 'Product restored successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch('publish')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish multiple products',
    description:
      'Publishes multiple products by changing their status from DRAFT to READY.',
  })
  @ApiBody({ type: ProductStatusBulkActionDto })
  @ApiOkResponse({
    description: 'Products published successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Products published successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async publishProducts(
    @Req() req: Request,
    @Body() dto: ProductStatusBulkActionDto,
  ): Promise<ResponsePayload> {
    await this.productService.publishProducts(req.user!.userId, dto.productIds);

    return {
      message: 'Products published successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch('remove')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove multiple products',
    description:
      'Removes multiple products by changing their status from READY to REMOVED.',
  })
  @ApiBody({ type: ProductStatusBulkActionDto })
  @ApiOkResponse({
    description: 'Products removed successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Products removed successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async removeProducts(
    @Req() req: Request,
    @Body() dto: ProductStatusBulkActionDto,
  ): Promise<ResponsePayload> {
    await this.productService.removeProducts(req.user!.userId, dto.productIds);

    return {
      message: 'Products removed successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch('restore')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore multiple products',
    description:
      'Restores multiple products by changing their status from REMOVED to DRAFT.',
  })
  @ApiBody({ type: ProductStatusBulkActionDto })
  @ApiOkResponse({
    description: 'Products restored successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Products restored successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async restoreProducts(
    @Req() req: Request,
    @Body() dto: ProductStatusBulkActionDto,
  ): Promise<ResponsePayload> {
    await this.productService.restoreProducts(req.user!.userId, dto.productIds);

    return {
      message: 'Products restored successfully',
      data: {},
    };
  }

  @Get(':id')
  @Auth(AuthType.OPTIONAL)
  @Throttle({
    short: { ttl: 1_000, limit: 20 },
    medium: { ttl: 10_000, limit: 100 },
    long: { ttl: 60_000, limit: 500 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Retrieves detailed information about a product. Authentication is optional and may affect the information visible to the current user.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    description: 'Product retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetProductByIdResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Product retrieved successfully',
      data: {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Sony Alpha Camera',
        description: 'A mirrorless camera in excellent condition.',
        stockQuantity: 10,
        status: 'READY',
        publicCategory: 'ELECTRONICS',
        seller: {
          userId: '660e8400-e29b-41d4-a716-446655440000',
          username: 'nguyenvana',
        },
        createdAt: '2026-09-22T05:30:00.000Z',
        updatedAt: '2026-09-22T06:00:00.000Z',
        categories: [
          {
            categoryId: '770e8400-e29b-41d4-a716-446655440000',
            name: 'Cameras',
          },
        ],
        images: [
          {
            imageId: '880e8400-e29b-41d4-a716-446655440000',
            imageUrl: 'https://storage.example.com/products/camera/image.jpg',
            isPrimary: true,
            imageKey: 'products/camera/image.jpg',
          },
        ],
        documents: [
          {
            documentId: '990e8400-e29b-41d4-a716-446655440000',
            documentName: 'User Manual.pdf',
            documentUrl:
              'https://storage.example.com/products/camera/manual.pdf',
            documentKey: 'products/camera/manual.pdf',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  async getProductById(
    @Param('id') productId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const product = await this.productService.getProductById(
      productId,
      req.user?.userId,
    );

    return {
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Post()
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product',
    description: 'Creates a new product for the authenticated seller.',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({
    description: 'Product created successfully',
    type: SuccessResponse,
    example: {
      statusCode: 201,
      message: 'Product created successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_CATEGORIES_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CATEGORIES_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: ERROR_PRODUCT_NAME_ALREADY_EXISTS.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NAME_ALREADY_EXISTS,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async createProduct(
    @Req() req: Request,
    @Body() dto: CreateProductDto,
  ): Promise<ResponsePayload> {
    await this.productService.createProduct(req.user!.userId, dto);

    return {
      message: 'Product created successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Put()
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 10_000, limit: 20 },
    long: { ttl: 60_000, limit: 100 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product',
    description:
      'Updates the product information and, when provided, replaces its category associations.',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product updated successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: 'Product update validation failed',
    type: ErrorResponse,
    examples: {
      cannotUpdateProduct: {
        summary: 'Product cannot be updated in its current status',
        value: ERROR_CANNOT_UPDATE_PRODUCT,
      },
      cannotSetProductStatus: {
        summary: 'Requested product status cannot be set directly',
        value: ERROR_CANNOT_SET_PRODUCT_STATUS,
      },
      categoriesNotFound: {
        summary: 'One or more categories were not found',
        value: ERROR_CATEGORIES_NOT_FOUND,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async updateProduct(
    @Req() req: Request,
    @Body() dto: UpdateProductDto,
  ): Promise<ResponsePayload> {
    await this.productService.updateProduct(req.user!.userId, dto);

    return {
      message: 'Product updated successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Delete('bulk/:ids')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete multiple products',
    description:
      'Deletes multiple products specified as a comma-separated list of product IDs.',
  })
  @ApiParam({
    name: 'ids',
    type: String,
    description: 'Comma-separated product IDs',
    example:
      '018f3c5e-7b3a-7abc-8def-1234567890ab,018f3c5e-7b3a-7def-8abc-abcdef123456',
  })
  @ApiOkResponse({
    description: 'Products deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Products deleted successfully',
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
  async deleteMultipleProducts(
    @Req() req: Request,
    @Param('ids') ids: string,
  ): Promise<ResponsePayload> {
    await this.productService.deleteMultipleProducts(
      req.user!.userId,
      ids.split(',').map((id) => id.trim()),
    );

    return {
      message: 'Products deleted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product',
    description: 'Deletes a product and its associated files.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product deleted successfully',
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
  async deleteProduct(
    @Req() req: Request,
    @Param('id') productId: string,
  ): Promise<ResponsePayload> {
    await this.productService.deleteProductById(req.user!.userId, productId);

    return {
      message: 'Product deleted successfully',
      data: {},
    };
  }
}
