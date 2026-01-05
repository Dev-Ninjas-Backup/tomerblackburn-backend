import { Module } from '@nestjs/common';
import { CostCodeCategoriesService } from './cost-code-categories.service';
import { CostCodeCategoriesController } from './cost-code-categories.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [CostCodeCategoriesController],
  providers: [CostCodeCategoriesService, PrismaService],
  exports: [CostCodeCategoriesService],
})
export class CostCodeCategoriesModule {}
