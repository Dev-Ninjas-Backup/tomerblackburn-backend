import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTermsOfServiceDto } from './dto/create-terms-of-service.dto';
import { UpdateTermsOfServiceDto } from './dto/update-terms-of-service.dto';

@Injectable()
export class TermsOfServiceService {
  private readonly SINGLETON_ID = 'terms-of-service-singleton';

  constructor(private readonly prisma: PrismaService) {}

  async get() {
    try {
      const termsOfService = await this.prisma.termsOfService.findUnique({
        where: { id: this.SINGLETON_ID },
      });

      if (!termsOfService) {
        throw new NotFoundException('Terms of service not found');
      }

      return {
        message: 'Terms of service retrieved successfully',
        data: termsOfService,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve terms of service: ${error.message}`);
    }
  }

  async createOrUpdate(dto: CreateTermsOfServiceDto | UpdateTermsOfServiceDto) {
    try {
      const termsOfService = await this.prisma.termsOfService.upsert({
        where: { id: this.SINGLETON_ID },
        create: {
          id: this.SINGLETON_ID,
          title: (dto as CreateTermsOfServiceDto).title,
          effectiveDate: new Date(
            (dto as CreateTermsOfServiceDto).effectiveDate,
          ),
          body: (dto as CreateTermsOfServiceDto).body,
        },
        update: {
          ...(dto.title && { title: dto.title }),
          ...(dto.effectiveDate && {
            effectiveDate: new Date(dto.effectiveDate),
          }),
          ...(dto.body && { body: dto.body }),
        },
      });

      return {
        message: 'Terms of service saved successfully',
        data: termsOfService,
      };
    } catch (error) {
      throw new Error(`Failed to save terms of service: ${error.message}`);
    }
  }
}
