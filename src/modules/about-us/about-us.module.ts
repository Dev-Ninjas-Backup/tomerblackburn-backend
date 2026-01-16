import { Module } from '@nestjs/common';
import { AboutUsService } from './about-us.service';
import { AboutUsController } from './about-us.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AboutUsController],
  providers: [AboutUsService],
  exports: [AboutUsService],
})
export class AboutUsModule {}
