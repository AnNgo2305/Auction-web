import { Body, Controller, Delete, Param, Put, Req } from '@nestjs/common';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { Role } from '@generated/prisma/enums';
import { Request } from 'express';
import { ProductDocumentService } from './product-document.service';
import { UpdateProductDocumentsDto } from './dtos/update-product-documents.body.dto';
import { DeleteProductDocumentsDto } from './dtos/delete-product-documents.body.dto';

@Controller('product-documents')
export class ProductDocumentController {
  constructor(
    private readonly productDocumentService: ProductDocumentService,
  ) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Roles(Role.SELLER)
  @Put(':productId/documents')
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
