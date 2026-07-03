import { Injectable } from '@nestjs/common';
// import { PrismaService } from '@common/services/prisma.service';
// import { FileService } from '@common/services/file.service';

@Injectable()
export class ProductImageService {
  // constructor(
  //   private readonly prisma: PrismaService,
  //   private readonly fileService: FileService,
  // ) {}
  //
  // async updateProductImages(
  //   productId: string,
  //   files: Express.Multer.File[],
  // ): Promise<void> {
  //   const oldImages = await this.prisma.productImage.findMany({
  //     where: { productId },
  //   });
  //   for (const img of oldImages) {
  //     await this.fileService.deleteFile(img.imageUrl);
  //   }
  //   await this.prisma.productImage.deleteMany({ where: { productId } });
  //
  //   const imagesData: { imageUrl: string; isPrimary: boolean }[] = [];
  //   if (files && files.length > 0) {
  //     const MAX_SIZE = 5 * 1024 * 1024;
  //     const allowedMimeTypes = [
  //       'image/jpeg',
  //       'image/png',
  //       'image/webp',
  //       'image/gif',
  //     ];
  //
  //     for (const [index, file] of files.entries()) {
  //       if (file.size > MAX_SIZE)
  //         throw new Error('File size exceeds 5MB limit');
  //       if (!allowedMimeTypes.includes(file.mimetype))
  //         throw new Error(
  //           'Invalid file type. Only JPEG, PNG, GIF, WEBP are allowed.',
  //         );
  //
  //       const imageUrl = await this.fileService.uploadFile('products', file);
  //       imagesData.push({ imageUrl, isPrimary: index === 0 });
  //     }
  //
  //     await this.prisma.productImage.createMany({
  //       data: imagesData.map((img) => ({ ...img, productId })),
  //     });
  //   }
  // }
}
