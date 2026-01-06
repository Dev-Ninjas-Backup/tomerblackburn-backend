import { Module } from '@nestjs/common';
import { BathroomTypeCostCodesService } from './bathroom-type-cost-codes.service';
import { BathroomTypeCostCodesController } from './bathroom-type-cost-codes.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [BathroomTypeCostCodesController],
  providers: [BathroomTypeCostCodesService, PrismaService],
  exports: [BathroomTypeCostCodesService],
})
export class BathroomTypeCostCodesModule {}
