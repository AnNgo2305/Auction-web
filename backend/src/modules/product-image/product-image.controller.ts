import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Req,
} from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@generated/prisma/enums';
import { UpdateProductImagesDto } from '@modules/product-image/dtos/update-product-images.body.dto';
import { DeleteProductImagesDto } from '@modules/product-image/dtos/delete-product-images.body.dto';
import { ResponsePayload } from '@common/types/response.interface';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import {
  ERROR_PRODUCT_IMAGE_CANNOT_DELETE_ALL_IMAGES,
  ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE,
  ERROR_PRODUCT_IMAGE_NOT_FOUND,
  ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED,
} from '@modules/product-image/product-image.constant';
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';

@ApiTags('Product Images')
@ApiExtraModels(SuccessResponse, ErrorResponse)
@Controller('product-images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Put(':productId/images')
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product images',
    description:
      'Replaces the product images and updates which image is marked as primary. Exactly one image must be primary.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiBody({
    type: UpdateProductImagesDto,
    description: 'Product images to associate with the product',
  })
  @ApiOkResponse({
    description: 'Product images updated successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product images updated successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED,
  })
  @ApiNotFoundResponse({
    description: ERROR_PRODUCT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_NOT_FOUND,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async updateProductImages(
    @Param('productId') productId: string,
    @Body() body: UpdateProductImagesDto,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    await this.productImageService.updateProductImages(
      userId,
      productId,
      body.images,
    );
    return {
      message: 'Product images updated successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Delete(':productId/images/:imageId')
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product image',
    description:
      'Deletes a product image. The last remaining image cannot be deleted.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiParam({ name: 'imageId', type: String, description: 'Product image ID' })
  @ApiOkResponse({
    description: 'Product image deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product image deleted successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE,
  })
  @ApiNotFoundResponse({
    description: 'Product or product image not found',
    type: ErrorResponse,
    examples: {
      productNotFound: {
        summary: 'Product not found',
        value: ERROR_PRODUCT_NOT_FOUND,
      },
      imageNotFound: {
        summary: 'Product image not found',
        value: ERROR_PRODUCT_IMAGE_NOT_FOUND,
      },
    },
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteProductImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    await this.productImageService.deleteProductImage(
      userId,
      productId,
      imageId,
    );
    return {
      message: 'Product image deleted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Delete(':productId/images')
  @Throttle({
    short: { ttl: 1_000, limit: 1 },
    medium: { ttl: 10_000, limit: 3 },
    long: { ttl: 60_000, limit: 10 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete multiple product images',
    description:
      'Deletes multiple product images at once. At least one image must remain after deletion.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiBody({
    type: DeleteProductImagesDto,
    description: 'Product image IDs to delete',
  })
  @ApiOkResponse({
    description: 'Product images deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product images deleted successfully',
      data: {},
    },
  })
  @ApiBadRequestResponse({
    description: ERROR_PRODUCT_IMAGE_CANNOT_DELETE_ALL_IMAGES.message,
    type: ErrorResponse,
    example: ERROR_PRODUCT_IMAGE_CANNOT_DELETE_ALL_IMAGES,
  })
  @ApiNotFoundResponse({
    description: 'Product or product image not found',
    type: ErrorResponse,
    examples: {
      productNotFound: {
        summary: 'Product not found',
        value: ERROR_PRODUCT_NOT_FOUND,
      },
      imageNotFound: {
        summary: 'Product image not found',
        value: ERROR_PRODUCT_IMAGE_NOT_FOUND,
      },
    },
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteMultipleProductImages(
    @Param('productId') productId: string,
    @Body() body: DeleteProductImagesDto,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    await this.productImageService.deleteMultipleProductImages(
      userId,
      productId,
      body.imageIds,
    );
    return {
      message: 'Product images deleted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Patch(':productId/images/:imageId/primary')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  async setPrimaryImage(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    await this.productImageService.setPrimaryImage(userId, productId, imageId);
    return {
      message: 'Primary product image updated successfully',
      data: {},
    };
  }
}
