import { Module } from '@nestjs/common';
import { HomePageService } from './home-page.service';
import { HomePageController } from './home-page.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomePageController],
  providers: [HomePageService],
  exports: [HomePageService],
})
export class HomePageModule {}
