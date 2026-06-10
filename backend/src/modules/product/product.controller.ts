import {
  Controller,
  Delete,
  Req,
  Param,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  UseInterceptors,
  Body,
  UploadedFiles,
  Query,
  Put,
} from '@nestjs/common';
import { ProductService } from '@modules/product/product.service';
import { Role } from '@generated/prisma/enums';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Roles } from '@common/decorators/roles.decorator';
import { Request } from 'express';
import { ResponsePayload } from '@common/types/response.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from '@modules/product/dtos/create-product.body.dto';
import { UpdateProductDto } from '@modules/product/dtos/update-product.body.dto';
import { GetProductsQueryDto } from '@modules/product/dtos/get-product.query.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.OK)
  @Delete(':ids')
  async deleteMultipleProducts(
    @Param('ids') ids: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const productIds = ids.split(',').map((id) => id.trim());

    await this.productService.deleteMultipleProducts(
      userId as string,
      productIds,
    );
    return {
      message: 'Products deleted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.OK)
  @Put()
  @UseInterceptors(FilesInterceptor('images'))
  async updateProduct(
    @Req() req: Request,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    await this.productService.updateProduct(userId as string, dto, files);

    return {
      message: 'Product updated successfully',
      data: {},
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.OPTIONAL)
  async getProductById(
    @Param('id') productId: string,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const product = await this.productService.getProductById(
      productId,
      currentUserId,
    );
    return {
      message: 'Product fetched successfully',
      data: product,
    };
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.OPTIONAL)
  async getProductsByUserId(
    @Param('userId') userId: string,
    @Query() query: GetProductsQueryDto,
    @Req() req: Request,
  ): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const products = await this.productService.getProductsByUserId(
      userId,
      query,
      currentUserId,
    );
    return {
      message: 'Products fetched successfully',
      data: products,
    };
  }

  @Post()
  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @Req() req: Request,
    @Body() productData: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    await this.productService.createProduct(
      userId as string,
      productData,
      files,
    );
    return {
      message: 'Product created successfully',
      data: {},
    };
  }
}
