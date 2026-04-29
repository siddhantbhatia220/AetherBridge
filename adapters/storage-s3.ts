import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageAdapter } from '../contracts/storage.js';

export class S3Adapter implements IStorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(region: string, bucket: string, accessKey: string, secretKey: string) {
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
    this.bucket = bucket;
  }

  async uploadFile(file: any, path: string) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: file,
    }));
    const url = await this.getFileUrl(path);
    return { url, key: path };
  }

  async getFileUrl(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string) {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
