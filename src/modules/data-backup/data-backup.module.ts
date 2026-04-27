import { Module } from '@nestjs/common';
import { DataBackupController } from './data-backup.controller';
import { DataBackupService } from './data-backup.service';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DataBackupController],
  providers: [DataBackupService],
})
export class DataBackupModule {}
