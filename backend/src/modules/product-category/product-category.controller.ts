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

@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Get('me')
  @Roles(Role.SELLER)
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.CREATED)
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
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
