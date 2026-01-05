import { PartialType } from '@nestjs/swagger';
import { CreateSubmissionItemDto } from './create-submission-item.dto';

export class UpdateSubmissionItemDto extends PartialType(CreateSubmissionItemDto) {}
