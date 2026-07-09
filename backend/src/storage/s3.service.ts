import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private readonly client = new S3Client({ region: process.env.AWS_REGION });
  private readonly bucket = process.env.AWS_S3_BUCKET as string;

  async uploadFile(key: string, filePath: string, contentType: string): Promise<string> {
    const body = fs.createReadStream(filePath);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
