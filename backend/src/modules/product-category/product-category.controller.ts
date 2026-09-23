import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@generated/prisma/enums';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryBodyDto } from './dtos/create-product-category.body.dto';
import { DeleteProductCategoriesBodyDto } from './dtos/delete-product-categories.body.dto';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
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
  ERROR_CATEGORY_ALREADY_EXISTS,
  ERROR_CATEGORY_NOT_FOUND,
} from '@modules/product-category/product-category.constant';
import { ERROR_CATEGORIES_NOT_FOUND } from '@modules/product/product.constant';
import { GetMyProductCategoriesResponseDto } from '@modules/product-category/dtos/get-my-product-categories.response.dto';

@ApiTags('Product Categories')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  GetMyProductCategoriesResponseDto,
)
@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get('me')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my product categories',
    description:
      'Retrieves all product categories created by the authenticated seller.',
  })
  @ApiOkResponse({
    description: 'Product categories retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetMyProductCategoriesResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Product categories retrieved successfully',
      data: {
        categories: [
          {
            categoryId: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Electronics',
            color: '#3B82F6',
          },
        ],
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getMyProductCategories(@Req() req: Request): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const result = await this.productCategoryService.getMyProductCategories(
      userId as string,
    );
    return {
      message: 'Product categories retrieved successfully',
      data: result,
    };
  }

  @Post()
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product category',
    description: 'Creates a new product category for the authenticated seller.',
  })
  @ApiBody({ type: CreateProductCategoryBodyDto })
  @ApiCreatedResponse({
    description: 'Product category created successfully',
    type: SuccessResponse,
    example: {
      statusCode: 201,
      message: 'Product category created successfully',
      data: {},
    },
  })
  @ApiConflictResponse({
    description: ERROR_CATEGORY_ALREADY_EXISTS.message,
    type: ErrorResponse,
    example: ERROR_CATEGORY_ALREADY_EXISTS,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async createProductCategory(
    @Req() req: Request,
    @Body() dto: CreateProductCategoryBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    await this.productCategoryService.createProductCategory(
      userId as string,
      dto.name,
      dto.color,
    );

    return {
      message: 'Product category created successfully',
      data: {},
    };
  }

  @Delete(':categoryId')
  @Roles(Role.SELLER)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product category',
    description:
      'Deletes a product category owned by the authenticated seller.',
  })
  @ApiParam({
    name: 'categoryId',
    type: String,
    description: 'Product category ID',
  })
  @ApiOkResponse({
    description: 'Product category deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product category deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_CATEGORY_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CATEGORY_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteProductCategoryById(
    @Req() req: Request,
    @Param('categoryId') categoryId: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    await this.productCategoryService.deleteProductCategoryById(
      userId as string,
      categoryId,
    );

    return {
      message: 'Product category deleted successfully',
      data: {},
    };
  }

  @Delete()
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 1 },
    medium: { ttl: 10_000, limit: 3 },
    long: { ttl: 60_000, limit: 10 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product categories',
    description:
      'Deletes multiple product categories owned by the authenticated seller.',
  })
  @ApiBody({ type: DeleteProductCategoriesBodyDto })
  @ApiOkResponse({
    description: 'Product categories deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product categories deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_CATEGORIES_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CATEGORIES_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteProductCategories(
    @Req() req: Request,
    @Body() dto: DeleteProductCategoriesBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    await this.productCategoryService.deleteProductCategories(
      userId as string,
      dto.categoryIds,
    );

    return {
      message: 'Product categories deleted successfully',
      data: {},
    };
  }
}
