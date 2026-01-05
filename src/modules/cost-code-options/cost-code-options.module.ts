import { Module } from '@nestjs/common';
import { CostCodeOptionsService } from './cost-code-options.service';
import { CostCodeOptionsController } from './cost-code-options.controller';

@Module({
  controllers: [CostCodeOptionsController],
  providers: [CostCodeOptionsService],
})
export class CostCodeOptionsModule {}
