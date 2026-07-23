import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { FileService } from '@common/services/file.service';
import { LoggerService } from '@common/services/logger.service';
import { ERROR_PRODUCT_DOCUMENT_NOT_FOUND } from '@modules/product-document/product-document.constant';
import {
  ERROR_PRODUCT_ACCESS_DENIED,
  ERROR_PRODUCT_NOT_FOUND,
} from '@modules/product/product.constant';

@Injectable()
export class ProductDocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  async updateProductDocuments(
    userId: string,
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
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to update documents of product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

    const currentDocuments = await this.prisma.productDocument.findMany({
      where: {
        productId,
      },
      select: {
        documentKey: true,
        documentName: true,
      },
    });

    const currentDocumentKeys = new Set(
      currentDocuments.map((document) => document.documentKey),
    );

    const newDocumentKeys = new Set(
      documents.map((document) => document.documentKey),
    );

    const deletedDocumentKeys = [...currentDocumentKeys].filter(
      (key) => !newDocumentKeys.has(key),
    );

    const addedDocumentKeys = documents.filter(
      (document) => !currentDocumentKeys.has(document.documentKey),
    );

    await this.prisma.$transaction(async (tx) => {
      if (deletedDocumentKeys.length > 0) {
        await tx.productDocument.deleteMany({
          where: {
            productId,
            documentKey: {
              in: deletedDocumentKeys,
            },
          },
        });
      }

      if (addedDocumentKeys.length > 0) {
        await tx.productDocument.createMany({
          data: addedDocumentKeys.map((document) => ({
            productId,
            documentName: document.documentName,
            documentKey: document.documentKey,
          })),
        });
      }
    });

    this.logger.debug(
      `Updated ${documents.length} documents for product ${productId}`,
    );
  }

  async deleteProductDocument(
    userId: string,
    productId: string,
    documentId: string,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to delete document from product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

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
    userId: string,
    productId: string,
    documentIds: string[],
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to delete documents from product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

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
