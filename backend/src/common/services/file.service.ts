import { Inject, Injectable } from '@nestjs/common';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsV2Command,
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
  UPLOAD_PURPOSE,
  UploadPurpose,
} from '@common/types/upload-file';

type MoveObjectsInput = {
  keys: string[];
  purpose: UploadPurpose;
  entityId: string;
  messageId?: string;
};

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

  private getFileName(key: string): string {
    const fileName = key.split('/').pop();

    if (!fileName) {
      throw new Error(`Invalid S3 key: ${key}`);
    }

    return fileName;
  }

  private getFileNames(keys: string[]): string[] {
    return keys.map((key) => this.getFileName(key));
  }

  private buildTempKey(
    userId: string,
    purpose: UploadPurpose,
    mimeType: string,
  ): string {
    const uuid = randomUUID();
    const ext = this.getExtension(mimeType);

    switch (purpose) {
      case UPLOAD_PURPOSE.AVATAR:
        return `tmp/users/${userId}/avatar/${uuid}.${ext}`;

      case UPLOAD_PURPOSE.COVER:
        return `tmp/users/${userId}/cover/${uuid}.${ext}`;

      case UPLOAD_PURPOSE.PRODUCT_IMAGE:
        return `tmp/products/${userId}/images/${uuid}.${ext}`;

      case UPLOAD_PURPOSE.PRODUCT_DOCUMENT:
        return `tmp/products/${userId}/documents/${uuid}.${ext}`;

      case UPLOAD_PURPOSE.CHAT_ATTACHMENT:
        return `tmp/chat/${userId}/attachments/${uuid}.${ext}`;

      default:
        return '';
    }
  }

  private buildDestinationKey(
    entityId: string,
    purpose: UploadPurpose,
    fileName: string,
    messageId?: string,
  ): string {
    switch (purpose) {
      case UPLOAD_PURPOSE.AVATAR:
        return `public/users/${entityId}/avatar/${fileName}`;

      case UPLOAD_PURPOSE.COVER:
        return `public/users/${entityId}/cover/${fileName}`;

      case UPLOAD_PURPOSE.PRODUCT_IMAGE:
        return `public/products/${entityId}/images/${fileName}`;

      case UPLOAD_PURPOSE.PRODUCT_DOCUMENT:
        return `public/products/${entityId}/documents/${fileName}`;

      case UPLOAD_PURPOSE.CHAT_ATTACHMENT:
        if (!messageId) {
          throw new Error('messageId is required for chat attachment');
        }

        return `public/chat/${entityId}/${messageId}/attachments/${fileName}`;
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  async createPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.config.presignedUrlExpiresIn,
    });
  }

  async createPresignedUploadUrl(
    userId: string,
    files: FileMetadata[],
    purpose: UploadPurpose,
  ): Promise<PresignedUrlResult[]> {
    return Promise.all(
      files.map(async (file) => {
        const key = this.buildTempKey(userId, purpose, file.mimeType);

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

  async moveObjects({
    keys,
    purpose,
    entityId,
    messageId,
  }: MoveObjectsInput): Promise<string[]> {
    const fileNames = this.getFileNames(keys);
    const destinationKeys = fileNames.map((fileName) =>
      this.buildDestinationKey(entityId, purpose, fileName, messageId),
    );

    await Promise.all(
      keys.map(async (sourceKey, index) => {
        const command = new CopyObjectCommand({
          Bucket: this.config.bucketName,
          CopySource: `${this.config.bucketName}/${sourceKey}`,
          Key: destinationKeys[index],
        });

        await this.s3Client.send(command);
      }),
    );

    await Promise.all(keys.map((key) => this.deleteObject(key)));

    return destinationKeys;
  }

  async headObject(key: string): Promise<HeadObjectCommandOutput> {
    const command = new HeadObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    return await this.s3Client.send(command);
  }

  async deleteExpiredTempFiles(maxAgeMs = 24 * 60 * 60 * 1000): Promise<void> {
    const expiredBefore = Date.now() - maxAgeMs;

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      Prefix: 'tmp/',
    });

    const result = await this.s3Client.send(command);

    const expiredKeys = (result.Contents ?? [])
      .filter(
        (object) =>
          object.Key &&
          object.LastModified &&
          object.LastModified.getTime() < expiredBefore,
      )
      .map((object) => object.Key!);

    if (expiredKeys.length === 0) {
      return;
    }

    await Promise.all(expiredKeys.map((key) => this.deleteObject(key)));
  }
}
