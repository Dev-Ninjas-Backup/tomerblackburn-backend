import { Module } from '@nestjs/common';
import { BathroomTypesService } from './bathroom-types.service';
import { BathroomTypesController } from './bathroom-types.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [BathroomTypesController],
  providers: [BathroomTypesService, PrismaService],
  exports: [BathroomTypesService],
})
export class BathroomTypesModule {}
