import {
  Body,
  Controller,
  Delete,
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

@Controller('product-images')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Put(':productId/images')
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
