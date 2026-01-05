import { PartialType } from '@nestjs/swagger';
import { CreateBathroomTypeCostCodeDto } from './create-bathroom-type-cost-code.dto';

export class UpdateBathroomTypeCostCodeDto extends PartialType(CreateBathroomTypeCostCodeDto) {}
