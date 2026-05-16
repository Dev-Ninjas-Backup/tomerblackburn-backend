import { Module } from '@nestjs/common';
import { HearAboutUsController } from './hear-about-us.controller';
import { HearAboutUsService } from './hear-about-us.service';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HearAboutUsController],
  providers: [HearAboutUsService],
  exports: [HearAboutUsService],
})
export class HearAboutUsModule {}
