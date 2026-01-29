import { Module } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [PrivacyPolicyController],
  providers: [PrivacyPolicyService, PrismaService],
})
export class PrivacyPolicyModule {}
