import { Module } from '@nestjs/common';
import { SubmissionMediaService } from './submission-media.service';
import { SubmissionMediaController } from './submission-media.controller';

@Module({
  controllers: [SubmissionMediaController],
  providers: [SubmissionMediaService],
})
export class SubmissionMediaModule {}
