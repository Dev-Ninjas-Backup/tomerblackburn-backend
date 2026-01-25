import { PartialType } from '@nestjs/swagger';
import { CreateNextStepDto } from './create-next-step.dto';

export class UpdateNextStepDto extends PartialType(CreateNextStepDto) {}
