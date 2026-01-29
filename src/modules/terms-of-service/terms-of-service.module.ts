import { Module } from '@nestjs/common';
import { TermsOfServiceService } from './terms-of-service.service';
import { TermsOfServiceController } from './terms-of-service.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [TermsOfServiceController],
  providers: [TermsOfServiceService, PrismaService],
})
export class TermsOfServiceModule {}
