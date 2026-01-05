import { PartialType } from '@nestjs/swagger';
import { CreateSubmissionMediaDto } from './create-submission-media.dto';

export class UpdateSubmissionMediaDto extends PartialType(CreateSubmissionMediaDto) {}
