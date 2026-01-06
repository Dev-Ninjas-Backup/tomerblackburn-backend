import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBathroomTypeCostCodeDto } from './create-bathroom-type-cost-code.dto';

export class UpdateBathroomTypeCostCodeDto extends PartialType(
  OmitType(CreateBathroomTypeCostCodeDto, [
    'bathroomTypeId',
    'costCodeId',
  ] as const),
) {}
