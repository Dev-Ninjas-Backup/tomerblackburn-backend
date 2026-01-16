import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { PdfGeneratorService } from '../pdf/pdf-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, PdfGeneratorService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
