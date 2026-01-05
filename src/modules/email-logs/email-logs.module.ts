import { Module } from '@nestjs/common';
import { EmailLogsService } from './email-logs.service';
import { EmailLogsController } from './email-logs.controller';

@Module({
  controllers: [EmailLogsController],
  providers: [EmailLogsService],
})
export class EmailLogsModule {}
