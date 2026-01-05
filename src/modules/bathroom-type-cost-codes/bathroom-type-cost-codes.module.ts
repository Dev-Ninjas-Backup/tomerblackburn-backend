import { Module } from '@nestjs/common';
import { BathroomTypeCostCodesService } from './bathroom-type-cost-codes.service';
import { BathroomTypeCostCodesController } from './bathroom-type-cost-codes.controller';

@Module({
  controllers: [BathroomTypeCostCodesController],
  providers: [BathroomTypeCostCodesService],
})
export class BathroomTypeCostCodesModule {}
