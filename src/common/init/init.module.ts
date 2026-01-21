import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InitService],
})
export class InitModule {}
