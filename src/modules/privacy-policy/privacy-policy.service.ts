import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';

@Injectable()
export class PrivacyPolicyService {
  private readonly SINGLETON_ID = 'privacy-policy-singleton';

  constructor(private readonly prisma: PrismaService) {}

  async get() {
    try {
      const privacyPolicy = await this.prisma.privacyPolicy.findUnique({
        where: { id: this.SINGLETON_ID },
      });

      if (!privacyPolicy) {
        throw new NotFoundException('Privacy policy not found');
      }

      return {
        message: 'Privacy policy retrieved successfully',
        data: privacyPolicy,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve privacy policy: ${error.message}`);
    }
  }

  async createOrUpdate(dto: CreatePrivacyPolicyDto | UpdatePrivacyPolicyDto) {
    try {
      const privacyPolicy = await this.prisma.privacyPolicy.upsert({
        where: { id: this.SINGLETON_ID },
        create: {
          id: this.SINGLETON_ID,
          title: (dto as CreatePrivacyPolicyDto).title,
          effectiveDate: new Date(
            (dto as CreatePrivacyPolicyDto).effectiveDate,
          ),
          body: (dto as CreatePrivacyPolicyDto).body,
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
        message: 'Privacy policy saved successfully',
        data: privacyPolicy,
      };
    } catch (error) {
      throw new Error(`Failed to save privacy policy: ${error.message}`);
    }
  }
}
