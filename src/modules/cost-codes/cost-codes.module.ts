import { Module } from '@nestjs/common';
import { CostCodesService } from './cost-codes.service';
import { CostCodesController } from './cost-codes.controller';

@Module({
  controllers: [CostCodesController],
  providers: [CostCodesService],
})
export class CostCodesModule {}
