import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client-runtime-utils';
import { ServiceCostCode } from 'generated/prisma/client';

export class ServiceCostCodeEntity implements ServiceCostCode {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  costCodeId: string;

  @ApiProperty()
  isIncludedInBase: boolean;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  isVisible: boolean;

  @ApiProperty()
  defaultQuantity: Decimal | null;

  @ApiProperty()
  priceOverride: Decimal | null;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
