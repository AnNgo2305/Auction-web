import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigType } from '@nestjs/config';
import s3Config from '@common/config/s3.config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
  FileMetadata,
  PresignedUrlResult,
  UploadPurpose,
} from '@common/types/upload-file';

@Injectable()
export class FileService {
  private readonly s3Client: S3Client;

  constructor(
    @Inject(s3Config.KEY)
    private readonly config: ConfigType<typeof s3Config>,
  ) {
    this.s3Client = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/jpg': 'jpg',

      'application/pdf': 'pdf',

      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',

      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'xlsx',

      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        'pptx',

      'text/plain': 'txt',
      'text/csv': 'csv',
    };

    return map[mimeType] ?? '';
  }

  private buildKey(
    entityId: string,
    purpose: UploadPurpose,
    mimeType: string,
  ): string {
    const uuid = randomUUID();
    const ext = this.getExtension(mimeType);

    switch (purpose) {
      case 'avatar':
        return `public/users/${entityId}/avatar/${uuid}.${ext}`;

      case 'cover':
        return `public/users/${entityId}/cover/${uuid}.${ext}`;

      case 'productImage':
        return `public/products/${entityId}/images/${uuid}.${ext}`;

      case 'productDocument':
        return `public/products/${entityId}/documents/${uuid}.${ext}`;

      default:
        return '';
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  async createPresignedUploadUrl(
    userId: string,
    files: FileMetadata[],
    purpose: UploadPurpose,
  ): Promise<PresignedUrlResult[]> {
    return Promise.all(
      files.map(async (file) => {
        const key = this.buildKey(userId, purpose, file.mimeType);

        const command = new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: key,
          ContentType: file.mimeType,
          Metadata: {
            originalName: file.originalFileName,
            size: String(file.size),
            mimeType: file.mimeType,
            uploadedBy: userId,
          },
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: this.config.presignedUrlExpiresIn,
        });

        return {
          uploadUrl,
          key,
        };
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async headObject(key: string): Promise<HeadObjectCommandOutput> {
    const command = new HeadObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    return await this.s3Client.send(command);
  }
}
