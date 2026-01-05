import { PartialType } from '@nestjs/swagger';
import { CreateCostCodeOptionDto } from './create-cost-code-option.dto';

export class UpdateCostCodeOptionDto extends PartialType(CreateCostCodeOptionDto) {}
