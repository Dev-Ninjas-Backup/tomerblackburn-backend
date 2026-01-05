import { Module } from '@nestjs/common';
import { CostCodeCategoriesService } from './cost-code-categories.service';
import { CostCodeCategoriesController } from './cost-code-categories.controller';

@Module({
  controllers: [CostCodeCategoriesController],
  providers: [CostCodeCategoriesService],
})
export class CostCodeCategoriesModule {}
