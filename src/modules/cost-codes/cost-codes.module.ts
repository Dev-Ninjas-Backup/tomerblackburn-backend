import { Module } from '@nestjs/common';
import { CostCodesService } from './cost-codes.service';
import { CostCodesController } from './cost-codes.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [CostCodesController],
  providers: [CostCodesService, PrismaService],
  exports: [CostCodesService],
})
export class CostCodesModule {}
