import { Module } from '@nestjs/common';
import { ServiceCostCodesService } from './service-cost-codes.service';
import { ServiceCostCodesController } from './service-cost-codes.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [ServiceCostCodesController],
  providers: [ServiceCostCodesService, PrismaService],
  exports: [ServiceCostCodesService],
})
export class ServiceCostCodesModule {}
