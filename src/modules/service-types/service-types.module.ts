import { Module } from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { ServiceTypesController } from './service-types.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService, PrismaService],
  exports: [ServiceTypesService],
})
export class ServiceTypesModule {}
