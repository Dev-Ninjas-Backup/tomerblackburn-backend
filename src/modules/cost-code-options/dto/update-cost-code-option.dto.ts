import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCostCodeOptionDto } from './create-cost-code-option.dto';

export class UpdateCostCodeOptionDto extends PartialType(
  OmitType(CreateCostCodeOptionDto, ['costCodeId'] as const),
) {}
