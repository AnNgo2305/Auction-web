import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { ResponsePayload } from '@common/types/response.interface';
import { Role } from '@generated/prisma/enums';
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
    @Param('productId') productId: string,
    @Body() body: UpdateProductDocumentsDto,
  ): Promise<ResponsePayload> {
    await this.productDocumentService.updateProductDocuments(
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
    @Param('productId') productId: string,
    @Param('documentId') documentId: string,
  ): Promise<ResponsePayload> {
    await this.productDocumentService.deleteProductDocument(
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
    @Param('productId') productId: string,
    @Body() body: DeleteProductDocumentsDto,
  ): Promise<ResponsePayload> {
    await this.productDocumentService.deleteMultipleProductDocuments(
      productId,
      body.documentIds,
    );

    return {
      message: 'Product documents deleted successfully',
      data: {},
    };
  }
}
