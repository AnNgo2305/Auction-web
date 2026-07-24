import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('product-comments')
export class ProductCommentController {
  constructor(private readonly productCommentService: ProductCommentService) {}

  @Auth(AuthType.NONE)
  @Get(':productId/comments')
  async getComments(
    @Param('productId') productId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
    @Req() req?: Request,
  ): Promise<ResponsePayload> {
    const userId = req?.user?.userId;

    const data = await this.productCommentService.getCommentsByProduct(
      productId,
      userId,
      cursor,
      limit,
    );

    return {
      message: 'Product comments retrieved successfully',
      data,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Post(':productId/comments')
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
