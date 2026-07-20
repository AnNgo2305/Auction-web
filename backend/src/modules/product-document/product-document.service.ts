import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { FileService } from '@common/services/file.service';
import { LoggerService } from '@common/services/logger.service';
import { ERROR_PRODUCT_DOCUMENT_NOT_FOUND } from '@modules/product-document/product-document.constant';
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';

@Injectable()
export class ProductDocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  async updateProductDocuments(
    productId: string,
    documents: {
      documentName: string;
      documentKey: string;
    }[],
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        productId: true,
      },
    });

    if (!product) {
      this.logger.warn(
        `Attempted to update documents for non-existing product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    const oldDocuments = await this.prisma.productDocument.findMany({
      where: {
        productId,
      },
      select: {
        documentKey: true,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.productDocument.deleteMany({
        where: {
          productId,
        },
      });

      if (documents.length) {
        await tx.productDocument.createMany({
          data: documents.map((document) => ({
            productId,
            documentName: document.documentName,
            documentKey: document.documentKey,
          })),
        });
      }
    });

    try {
      await Promise.all(
        oldDocuments.map((document) =>
          this.fileService.deleteObject(document.documentKey),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Updated product ${productId} but failed to delete old documents from S3`,
        error,
      );

      throw error;
    }

    this.logger.debug(
      `Updated ${documents.length} documents for product ${productId}`,
    );
  }

  async deleteProductDocument(
    productId: string,
    documentId: string,
  ): Promise<void> {
    this.logger.log(
      `Deleting product document. Product ID: ${productId}, Document ID: ${documentId}`,
    );

    const document = await this.prisma.productDocument.findFirst({
      where: {
        productId,
        documentId,
      },
      select: {
        documentId: true,
        documentKey: true,
      },
    });

    if (!document) {
      this.logger.warn(
        `Product document not found. Product ID: ${productId}, Document ID: ${documentId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_DOCUMENT_NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productDocument.delete({
        where: {
          documentId,
        },
      });

      this.logger.log(
        `Deleted product document from database. Document ID: ${documentId}`,
      );

      try {
        await this.fileService.deleteObject(document.documentKey);

        this.logger.log(
          `Deleted product document file. Key: ${document.documentKey}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to delete product document file. Key: ${document.documentKey}`,
          error,
        );
      }
    });

    this.logger.log(
      `Product document deleted successfully. Product ID: ${productId}, Document ID: ${documentId}`,
    );
  }

  async deleteMultipleProductDocuments(
    productId: string,
    documentIds: string[],
  ): Promise<void> {
    const documents = await this.prisma.productDocument.findMany({
      where: {
        productId,
        documentId: {
          in: documentIds,
        },
      },
      select: {
        documentId: true,
        documentKey: true,
      },
    });

    if (documents.length !== documentIds.length) {
      this.logger.warn(
        `Attempted to delete non-existing product documents for product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_DOCUMENT_NOT_FOUND);
    }

    await this.prisma.productDocument.deleteMany({
      where: {
        productId,
        documentId: {
          in: documentIds,
        },
      },
    });

    try {
      await Promise.all(
        documents.map((document) =>
          this.fileService.deleteObject(document.documentKey),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Deleted product documents from database but failed to delete files from S3 for product ${productId}`,
        error,
      );

      throw error;
    }

    this.logger.debug(
      `Deleted ${documents.length} documents for product ${productId}`,
    );
  }
}
