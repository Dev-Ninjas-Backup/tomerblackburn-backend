import { Module } from '@nestjs/common';
import { SubmissionItemsService } from './submission-items.service';
import { SubmissionItemsController } from './submission-items.controller';

@Module({
  controllers: [SubmissionItemsController],
  providers: [SubmissionItemsService],
})
export class SubmissionItemsModule {}
