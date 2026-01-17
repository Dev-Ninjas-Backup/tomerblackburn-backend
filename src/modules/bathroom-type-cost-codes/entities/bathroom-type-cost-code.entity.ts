import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client-runtime-utils';
import { BathroomTypeCostCode } from 'generated/prisma/client';

export class BathroomTypeCostCodeEntity implements BathroomTypeCostCode {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bathroomTypeId: string;

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
