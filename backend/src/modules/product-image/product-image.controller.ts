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
