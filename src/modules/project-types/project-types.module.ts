import { Module } from '@nestjs/common';
import { ProjectTypesService } from './project-types.service';
import { ProjectTypesController } from './project-types.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [ProjectTypesController],
  providers: [ProjectTypesService, PrismaService],
  exports: [ProjectTypesService],
})
export class ProjectTypesModule {}
