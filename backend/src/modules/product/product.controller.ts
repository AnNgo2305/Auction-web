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
