import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateServiceCostCodeDto } from './create-service-cost-code.dto';

export class UpdateServiceCostCodeDto extends PartialType(
  OmitType(CreateServiceCostCodeDto, ['serviceId', 'costCodeId'] as const),
) {}
