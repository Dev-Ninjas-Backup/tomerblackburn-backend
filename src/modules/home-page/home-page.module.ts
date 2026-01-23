import { Module } from '@nestjs/common';
import { HomePageService } from './home-page.service';
import { HomePageController } from './home-page.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [HomePageController],
  providers: [HomePageService],
  exports: [HomePageService],
})
export class HomePageModule {}
