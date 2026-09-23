import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { Role } from '@generated/prisma/enums';
import { Request } from 'express';
import { ProductDocumentService } from './product-document.service';
import { UpdateProductDocumentsDto } from './dtos/update-product-documents.body.dto';
import { DeleteProductDocumentsDto } from './dtos/delete-product-documents.body.dto';
import { Throttle } from '@nestjs/throttler';
import {
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
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';
import { ERROR_PRODUCT_DOCUMENT_NOT_FOUND } from '@modules/product-document/product-document.constant';

@ApiTags('Product Documents')
@ApiExtraModels(SuccessResponse, ErrorResponse)
@Controller('product-documents')
export class ProductDocumentController {
  constructor(
    private readonly productDocumentService: ProductDocumentService,
  ) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Put(':productId/documents')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product documents',
    description:
      'Replaces the documents associated with a product. New documents are moved to product storage and removed documents are deleted from storage.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiBody({
    type: UpdateProductDocumentsDto,
    description: 'Product documents to associate with the product',
  })
  @ApiOkResponse({
    description: 'Product documents updated successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product documents updated successfully',
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
  async updateProductDocuments(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Body() body: UpdateProductDocumentsDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;

    await this.productDocumentService.updateProductDocuments(
      userId,
      productId,
      body.documents,
    );

    return {
      message: 'Product documents updated successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Delete(':productId/documents/:documentId')
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete product document',
    description:
      'Deletes a document associated with a product from the database and removes its file from storage.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiParam({
    name: 'documentId',
    type: String,
    description: 'Product document ID',
  })
  @ApiOkResponse({
    description: 'Product document deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product document deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Product or product document not found',
    type: ErrorResponse,
    examples: {
      productNotFound: {
        summary: 'Product not found',
        value: ERROR_PRODUCT_NOT_FOUND,
      },
      documentNotFound: {
        summary: 'Product document not found',
        value: ERROR_PRODUCT_DOCUMENT_NOT_FOUND,
      },
    },
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteProductDocument(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Param('documentId') documentId: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;

    await this.productDocumentService.deleteProductDocument(
      userId,
      productId,
      documentId,
    );

    return {
      message: 'Product document deleted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Delete(':productId/documents')
  @Throttle({
    short: { ttl: 1_000, limit: 1 },
    medium: { ttl: 10_000, limit: 3 },
    long: { ttl: 60_000, limit: 10 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete multiple product documents',
    description:
      'Deletes multiple documents associated with a product. All specified document IDs must exist for the product.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiBody({
    type: DeleteProductDocumentsDto,
    description: 'Product document IDs to delete',
  })
  @ApiOkResponse({
    description: 'Product documents deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Product documents deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: 'Product or product document not found',
    type: ErrorResponse,
    examples: {
      productNotFound: {
        summary: 'Product not found',
        value: ERROR_PRODUCT_NOT_FOUND,
      },
      documentNotFound: {
        summary: 'One or more product documents not found',
        value: ERROR_PRODUCT_DOCUMENT_NOT_FOUND,
      },
    },
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async deleteMultipleProductDocuments(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Body() body: DeleteProductDocumentsDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;

    await this.productDocumentService.deleteMultipleProductDocuments(
      userId,
      productId,
      body.documentIds,
    );

    return {
      message: 'Product documents deleted successfully',
      data: {},
    };
  }
}
