import { PartialType } from '@nestjs/swagger';
import { CreateHowItWorksStepDto } from './create-how-it-works-step.dto';

export class UpdateHowItWorksStepDto extends PartialType(
  CreateHowItWorksStepDto,
) {}
