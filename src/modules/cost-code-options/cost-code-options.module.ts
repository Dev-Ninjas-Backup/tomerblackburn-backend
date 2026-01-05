import { Module } from '@nestjs/common';
import { CostCodeOptionsService } from './cost-code-options.service';
import { CostCodeOptionsController } from './cost-code-options.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [CostCodeOptionsController],
  providers: [CostCodeOptionsService, PrismaService],
  exports: [CostCodeOptionsService],
})
export class CostCodeOptionsModule {}
