import { Module } from '@nestjs/common';
import { EstimatorPageController } from './estimator-page.controller';
import { EstimatorPageService } from './estimator-page.service';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [EstimatorPageController],
  providers: [EstimatorPageService],
  exports: [EstimatorPageService],
})
export class EstimatorPageModule {}
