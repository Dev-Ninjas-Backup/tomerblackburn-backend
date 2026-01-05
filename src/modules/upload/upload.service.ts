import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from '@softvence/s3';
import { PrismaService } from '@/common/prisma/prisma.service';
import { FileType } from 'generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFileResponse {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  fileType: FileType;
  mimeType: string;
  size: number;
}

@Injectable()
export class UploadService {
  private s3Service: S3Service;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.s3Service = new S3Service({
      region: this.configService.get<string>('AWS_REGION')!,
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME')!,
    });
  }

  /**
   * Upload a single file to S3 and store metadata in database
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadedFileResponse> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate file
      this.validateFile(file);

      // Upload to S3 - @softvence/s3 automatically organizes files by mime type
      const uploadResult = await this.s3Service.uploadFile(file);

      // Determine file type
      const fileType = this.determineFileType(file.mimetype);

      // Store in database
      const fileInstance = await this.prisma.fileInstance.create({
        data: {
          filename: path.basename(uploadResult.url),
          originalFilename: uploadResult.originalName,
          path: `${uploadResult.folder}/${path.basename(uploadResult.url)}`,
          url: uploadResult.url,
          fileType,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
        },
      });

      return {
        id: fileInstance.id,
        filename: fileInstance.filename,
        originalFilename: fileInstance.originalFilename,
        url: fileInstance.url,
        fileType: fileInstance.fileType,
        mimeType: fileInstance.mimeType,
        size: fileInstance.size,
      };
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<UploadedFileResponse[]> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      const uploadPromises = files.map((file) => this.uploadFile(file, folder));

      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(
        `Multiple file upload failed: ${error.message}`,
      );
    }
  }

  /**
   * Delete file from database (S3 deletion not supported by @softvence/s3)
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const fileInstance = await this.prisma.fileInstance.findUnique({
        where: { id: fileId },
      });

      if (!fileInstance) {
        throw new BadRequestException(`File with ID ${fileId} not found`);
      }

      // Note: @softvence/s3 doesn't provide delete method
      // You may need to manually delete from S3 console or implement AWS SDK directly

      // Delete from database
      await this.prisma.fileInstance.delete({
        where: { id: fileId },
      });
    } catch (error) {
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string) {
    try {
      const fileInstance = await this.prisma.fileInstance.findUnique({
        where: { id: fileId },
      });

      if (!fileInstance) {
        throw new BadRequestException(`File with ID ${fileId} not found`);
      }

      return fileInstance;
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve file: ${error.message}`,
      );
    }
  }

  /**
   * Get signed URL for temporary access
   * Note: @softvence/s3 doesn't provide signed URL method
   * Files are publicly accessible via the URL
   */
  async getSignedUrl(
    fileId: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const fileInstance = await this.getFile(fileId);

      // Return the public URL since @softvence/s3 doesn't support signed URLs
      return fileInstance.url;
    } catch (error) {
      throw new BadRequestException(`Failed to get file URL: ${error.message}`);
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/mpeg',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`,
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }
  }

  /**
   * Determine file type based on mime type
   */
  private determineFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.image;
    } else if (mimeType.startsWith('video/')) {
      return FileType.video;
    } else if (mimeType.startsWith('audio/')) {
      return FileType.audio;
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('msword') ||
      mimeType.includes('document')
    ) {
      return FileType.document;
    } else {
      return FileType.any;
    }
  }
}
