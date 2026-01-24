import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SubmissionStatus } from 'generated/prisma/enums';
import {
  PdfGeneratorService,
  SubmissionPdfData,
} from '../pdf/pdf-generator.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubmissionsService {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {
    this.uploadsDir = path.join(process.cwd(), 'uploads');

    const port = this.configService.get<string>('PORT') || '3000';
    this.baseUrl =
      this.configService.get<string>('BASE_URL') || `http://localhost:${port}`;

    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  private async generateSubmissionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EST-${year}-`;

    const lastSubmission = await this.prisma.submission.findFirst({
      where: {
        submissionNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        submissionNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastSubmission) {
      const lastNumber = parseInt(
        lastSubmission.submissionNumber.replace(prefix, ''),
        10,
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  private async generateAndUploadPdf(submissionId: string): Promise<string> {
    // Get full submission data
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        service: true,
        submissionItems: {
          include: {
            costCode: true,
            selectedOption: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    // Prepare PDF data
    const pdfData: SubmissionPdfData = {
      submissionNumber: submission.submissionNumber,
      clientName: submission.clientName,
      clientEmail: submission.clientEmail,
      clientPhone: submission.clientPhone,
      projectAddress: submission.projectAddress,
      zipCode: submission.zipCode || undefined,
      service: {
        name: submission.service.name,
        code: submission.service.code,
      },
      basePrice: Number(submission.basePrice),
      additionalItemsTotal: Number(submission.additionalItemsTotal),
      totalAmount: Number(submission.totalAmount),
      submittedAt: submission.submittedAt,
      items: submission.submissionItems.map((item) => ({
        itemName: item.itemName || item.costCode?.name || 'Item',
        itemDescription:
          item.itemDescription || item.costCode?.description || undefined,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        selectedOptionName: item.selectedOptionName || undefined,
        isEnabled: item.isEnabled,
      })),
      projectNotes: submission.projectNotes || undefined,
    };

    const pdfBuffer =
      await this.pdfGeneratorService.generateSubmissionPdf(pdfData);

    const filename = `${submission.submissionNumber.replace(/\//g, '-')}-${uuidv4()}.pdf`;

    const subfolder = path.join(this.uploadsDir, 'document');
    await fs.mkdir(subfolder, { recursive: true });

    const filePath = path.join(subfolder, filename);

    await fs.writeFile(filePath, pdfBuffer);

    const relativePath = path.join('document', filename).replace(/\\/g, '/');
    const url = `${this.baseUrl}/uploads/${relativePath}`;

    return url;
  }

  async create(createSubmissionDto: CreateSubmissionDto) {
    try {
      const submissionNumber = await this.generateSubmissionNumber();

      const {
        serviceId,
        clientName,
        clientEmail,
        clientPhone,
        projectAddress,
        zipCode,
        basePrice,
        additionalItemsTotal,
        totalAmount,
        projectNotes,
        additionalDetails,
        items,
      } = createSubmissionDto;

      const submissionItemsData = items
        ? await Promise.all(
            items.map(async (item) => {
              const costCode = await this.prisma.costCode.findUnique({
                where: { id: item.costCodeId },
              });

              let selectedOption = null;
              if (item.selectedOptionId) {
                selectedOption = await this.prisma.costCodeOption.findUnique({
                  where: { id: item.selectedOptionId },
                });
              }

              const totalPrice = item.unitPrice * (item.quantity ?? 1);

              return {
                costCodeId: item.costCodeId,
                selectedOptionId: item.selectedOptionId,
                quantity: item.quantity ?? 1,
                unitPrice: item.unitPrice,
                totalPrice,
                questionType: costCode?.questionType,
                isEnabled: item.isEnabled ?? true,
                userInputValue: item.userInputValue,
                itemName: costCode?.name,
                itemDescription: costCode?.description,
                selectedOptionName: selectedOption?.optionName,
                notes: item.notes,
              };
            }),
          )
        : undefined;

      // Create submission
      let submission = await this.prisma.submission.create({
        data: {
          submissionNumber,
          serviceId,
          clientName,
          clientEmail,
          clientPhone,
          projectAddress,
          zipCode,
          basePrice,
          additionalItemsTotal: additionalItemsTotal ?? 0,
          totalAmount,
          projectNotes,
          additionalDetails,
          status: SubmissionStatus.PENDING,
          submissionItems: submissionItemsData
            ? { create: submissionItemsData }
            : undefined,
        },
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: true,
              selectedOption: true,
            },
          },
          submissionMedia: {
            include: {
              fileInstance: true,
            },
          },
        },
      });

      let pdfUrl: string | null = null;
      try {
        pdfUrl = await this.generateAndUploadPdf(submission.id);

        submission = await this.prisma.submission.update({
          where: { id: submission.id },
          data: { pdfUrl },
          include: {
            service: true,
            submissionItems: {
              include: {
                costCode: true,
                selectedOption: true,
              },
            },
            submissionMedia: {
              include: {
                fileInstance: true,
              },
            },
          },
        });
      } catch (pdfError) {
        console.error('Failed to generate PDF:', pdfError);
      }

      return {
        message: 'Estimate submission created successfully',
        data: submission,
        pdfUrl,
      };
    } catch (error) {
      throw new Error(`Failed to create submission: ${error.message}`);
    }
  }

  async findAll(status?: SubmissionStatus) {
    try {
      const where = status ? { status } : {};

      const submissions = await this.prisma.submission.findMany({
        where,
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: true,
              selectedOption: true,
            },
          },
          submissionMedia: {
            include: {
              fileInstance: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });

      return {
        message:
          submissions.length > 0
            ? 'Submissions retrieved successfully'
            : 'No submissions found',
        count: submissions.length,
        data: submissions,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve submissions: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id },
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: {
                include: {
                  category: true,
                },
              },
              selectedOption: true,
            },
          },
          submissionMedia: {
            include: {
              fileInstance: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
          emailLogs: {
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
      });

      if (!submission) {
        throw new NotFoundException(`Submission with ID ${id} not found`);
      }

      return {
        message: 'Submission retrieved successfully',
        data: submission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve submission: ${error.message}`);
    }
  }

  async findBySubmissionNumber(submissionNumber: string) {
    try {
      const submission = await this.prisma.submission.findUnique({
        where: { submissionNumber },
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: {
                include: {
                  category: true,
                },
              },
              selectedOption: true,
            },
          },
          submissionMedia: {
            include: {
              fileInstance: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      });

      if (!submission) {
        throw new NotFoundException(
          `Submission with number ${submissionNumber} not found`,
        );
      }

      return {
        message: 'Submission retrieved successfully',
        data: submission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve submission: ${error.message}`);
    }
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto) {
    try {
      await this.findOne(id);

      const submission = await this.prisma.submission.update({
        where: { id },
        data: updateSubmissionDto,
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: true,
              selectedOption: true,
            },
          },
          submissionMedia: {
            include: {
              fileInstance: true,
            },
          },
        },
      });

      return {
        message: 'Submission updated successfully',
        data: submission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update submission: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: SubmissionStatus) {
    try {
      await this.findOne(id);

      const updateData: any = { status };

      if (status === SubmissionStatus.PROCESSING) {
        updateData.reviewedAt = new Date();
      } else if (status === SubmissionStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }

      const submission = await this.prisma.submission.update({
        where: { id },
        data: updateData,
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: true,
              selectedOption: true,
            },
          },
        },
      });

      return {
        message: `Submission status updated to ${status}`,
        data: submission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update submission status: ${error.message}`);
    }
  }

  async regeneratePdf(id: string) {
    try {
      const { data: submission } = await this.findOne(id);

      const pdfUrl = await this.generateAndUploadPdf(submission.id);

      const updatedSubmission = await this.prisma.submission.update({
        where: { id },
        data: { pdfUrl },
        include: {
          service: true,
          submissionItems: {
            include: {
              costCode: true,
              selectedOption: true,
            },
          },
        },
      });

      return {
        message: 'PDF regenerated successfully',
        data: updatedSubmission,
        pdfUrl,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to regenerate PDF: ${error.message}`);
    }
  }

  async addMedia(
    submissionId: string,
    fileInstanceId: string,
    mediaType: 'PHOTO' | 'VIDEO',
    description?: string,
  ) {
    try {
      await this.findOne(submissionId);

      const existingMedia = await this.prisma.submissionMedia.count({
        where: { submissionId },
      });

      const media = await this.prisma.submissionMedia.create({
        data: {
          submissionId,
          fileInstanceId,
          mediaType,
          description,
          displayOrder: existingMedia,
        },
        include: {
          fileInstance: true,
        },
      });

      return {
        message: 'Media added to submission successfully',
        data: media,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to add media to submission: ${error.message}`);
    }
  }

  async removeMedia(mediaId: string) {
    try {
      const media = await this.prisma.submissionMedia.findUnique({
        where: { id: mediaId },
      });

      if (!media) {
        throw new NotFoundException(
          `Submission media with ID ${mediaId} not found`,
        );
      }

      await this.prisma.submissionMedia.delete({
        where: { id: mediaId },
      });

      return {
        message: 'Media removed from submission successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to remove media from submission: ${error.message}`,
      );
    }
  }

  async getDashboardStats() {
    try {
      const [total, pending, processing, completed, revenueResult] =
        await Promise.all([
          this.prisma.submission.count(),
          this.prisma.submission.count({
            where: { status: SubmissionStatus.PENDING },
          }),
          this.prisma.submission.count({
            where: { status: SubmissionStatus.PROCESSING },
          }),
          this.prisma.submission.count({
            where: { status: SubmissionStatus.COMPLETED },
          }),
          this.prisma.submission.aggregate({
            where: { status: SubmissionStatus.COMPLETED },
            _sum: { totalAmount: true },
          }),
        ]);

      // Convert Decimal to number for totalRevenue
      // Prisma returns Decimal as an object, need to convert to number
      const totalRevenueValue = revenueResult._sum.totalAmount;
      const totalRevenue =
        totalRevenueValue !== null && totalRevenueValue !== undefined
          ? Number(totalRevenueValue)
          : 0;

      return {
        message: 'Dashboard stats retrieved successfully',
        data: {
          totalSubmissions: total,
          pending,
          processing,
          completed,
          totalRevenue,
        },
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return default values instead of throwing to prevent frontend crashes
      return {
        message: 'Dashboard stats retrieved successfully',
        data: {
          totalSubmissions: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          totalRevenue: 0,
        },
      };
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      await this.prisma.submission.delete({
        where: { id },
      });

      return {
        message: 'Submission deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete submission: ${error.message}`);
    }
  }
}
